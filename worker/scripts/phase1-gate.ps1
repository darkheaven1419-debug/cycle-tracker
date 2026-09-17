# Phase 1 gate — cycle-tracker-data Worker
#
# Prints ONLY status codes, structural facts and counts. It never prints the app
# secret, the GitHub PAT, or any shared diary / mood / gratitude / todo content.
#
# The single write it attempts is a deliberately stale-baseSha PUT, which the
# Worker must reject with 409 — so this script cannot modify the data repo.
# If that check ever reports 200, CAS is broken AND the remote state has just
# been overwritten with {}: restore it from the data repo's git history.
#
# Usage (PowerShell 5.1 or 7):
#   powershell -ExecutionPolicy Bypass -File worker\scripts\phase1-gate.ps1

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch {}

$W    = 'https://cycle-tracker-data.cycletracker-barry.workers.dev'
$O    = 'https://darkheaven1419-debug.github.io'
$EVIL = 'https://evil.example'

$script:pass = 0
$script:fail = 0

function Check {
  param([string]$Name, [bool]$Ok, [string]$Detail)
  if ($Ok) {
    $script:pass++
    Write-Host ('PASS  {0,-44} {1}' -f $Name, $Detail) -ForegroundColor Green
  } else {
    $script:fail++
    Write-Host ('FAIL  {0,-44} {1}' -f $Name, $Detail) -ForegroundColor Red
  }
}

function Req {
  param([string]$Method, [string]$Path, [hashtable]$Headers, [string]$Body)
  $p = @{ Uri = "$W$Path"; Method = $Method; Headers = $Headers; UseBasicParsing = $true }
  if ($Body) { $p['Body'] = $Body; $p['ContentType'] = 'application/json' }
  try {
    $r = Invoke-WebRequest @p
    return @{ Status = [int]$r.StatusCode; Body = [string]$r.Content; Head = $r.Headers }
  } catch {
    $resp = $_.Exception.Response
    if (-not $resp) { return @{ Status = -1; Body = ''; Head = @{} } }
    $sr = New-Object IO.StreamReader($resp.GetResponseStream())
    $txt = $sr.ReadToEnd()
    return @{ Status = [int]$resp.StatusCode; Body = $txt; Head = $resp.Headers }
  }
}

# Works for both the success dictionary and the error-response header collection.
function Hdr {
  param($H, [string]$Name)
  if ($null -eq $H) { return '' }
  try {
    $v = $H[$Name]
    if ($null -eq $v) { return '' }
    return ([string]$v).Trim()
  } catch { return '' }
}

function ShaInfo {
  param($Sha)
  if ($null -eq $Sha -or "$Sha" -eq '') { return 'null' }
  return "len=$("$Sha".Length)"
}

function PatHits {
  param([string]$Text)
  if ([string]::IsNullOrEmpty($Text)) { return 0 }
  return ([regex]::Matches($Text, 'ghp_|github_pat_')).Count
}

Write-Host ''
$sec  = Read-Host 'Paste the app secret (input hidden)' -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)
$key  = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
Write-Host ('secret length = {0}   (43 = base64url of 32 random bytes)' -f $key.Length)
Write-Host ''

$AUTH   = @{ Origin = $O; Authorization = "Bearer $key" }
$NOAUTH = @{ Origin = $O }
$WRONG  = @{ Origin = $O; Authorization = 'Bearer wrong' }

# ── auth ────────────────────────────────────────────────────────────────────
$r = Req 'GET' '/health' $NOAUTH
Check '1  no secret -> 401' ($r.Status -eq 401) "status=$($r.Status)"

$r = Req 'GET' '/health' $WRONG
Check '2  wrong secret -> 401' ($r.Status -eq 401) "status=$($r.Status)"

$r = Req 'GET' '/health' $AUTH
$ok = $false
$detail = "status=$($r.Status)"
if ($r.Status -eq 200) {
  $b = $r.Body | ConvertFrom-Json
  $actor = [string]$b.actor
  $ok = ($b.ok -eq $true) -and ($actor -eq 'barry' -or $actor -eq 'andjela')
  $detail = "status=200 ok=$($b.ok) actor=$actor"
}
Check '3  correct secret -> 200' $ok $detail

# ── routing / CORS ──────────────────────────────────────────────────────────
$r = Req 'GET' '/nope' $WRONG
Check '6  unknown route -> 404' ($r.Status -eq 404) "status=$($r.Status)"

$r = Req 'DELETE' '/state' $WRONG
$allow = Hdr $r.Head 'Allow'
Check '7  bad method -> 405 + Allow' (($r.Status -eq 405) -and ($allow -like '*PUT*')) "status=$($r.Status) Allow='$allow'"

$r = Req 'OPTIONS' '/state' @{ Origin = $O; 'Access-Control-Request-Method' = 'PUT' }
$acao = Hdr $r.Head 'Access-Control-Allow-Origin'
Check '8  OPTIONS prod origin -> 204 + CORS' (($r.Status -eq 204) -and ($acao -eq $O)) "status=$($r.Status) ACAO='$acao'"

$r = Req 'GET' '/health' @{ Origin = $EVIL; Authorization = 'Bearer wrong' }
$acao2 = Hdr $r.Head 'Access-Control-Allow-Origin'
Check '9  bad origin -> 403, no ACAO' (($r.Status -eq 403) -and ($acao2 -eq '')) "status=$($r.Status) ACAO='$acao2'"

# ── reads: status + shape only, never values ────────────────────────────────
$r = Req 'GET' '/state' $AUTH
$ok = $false
$detail = "status=$($r.Status)"
if ($r.Status -eq 200) {
  $b = $r.Body | ConvertFrom-Json
  $envKeys = @($b.PSObject.Properties.Name)
  $inner = $b.state
  $keyCount = 0
  if ($null -ne $inner) { $keyCount = @($inner.PSObject.Properties.Name).Count }
  $ok = ($envKeys -contains 'sha') -and ($envKeys -contains 'state') -and
        ($null -eq $inner -or $inner -is [PSCustomObject])
  $detail = "status=200 envelope=[$($envKeys -join ',')] sha=$(ShaInfo $b.sha) stateKeys=$keyCount"
}
Check '4  /state GET -> 200 + shape' $ok $detail

$r = Req 'GET' '/todo' $AUTH
$ok = $false
$detail = "status=$($r.Status)"
if ($r.Status -eq 200) {
  $b = $r.Body | ConvertFrom-Json
  $envKeys = @($b.PSObject.Properties.Name)
  $items = $b.todo
  $isArr = $items -is [Array]
  $n = 0
  $fields = @()
  if ($isArr) {
    $n = @($items).Count
    foreach ($it in $items) { $fields += @($it.PSObject.Properties.Name) }
    $fields = @($fields | Sort-Object -Unique)
  }
  $ok = ($envKeys -contains 'sha') -and ($envKeys -contains 'todo') -and $isArr
  $detail = "status=200 envelope=[$($envKeys -join ',')] sha=$(ShaInfo $b.sha) items=$n itemFields=[$($fields -join ',')]"
}
Check '5  /todo GET -> 200 + shape' $ok $detail

# ── PAT non-exposure: report a count, never the content ─────────────────────
$hits = 0
foreach ($path in @('/health', '/state', '/todo')) {
  $r = Req 'GET' $path $AUTH
  $hits += (PatHits $r.Body)
}
Check '10 no PAT-shaped string in bodies' ($hits -eq 0) "matches=$hits"

# ── CAS: a stale baseSha must 409 and must NOT write ────────────────────────
$stale = 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
$r = Req 'PUT' '/state' $AUTH ('{"baseSha":"' + $stale + '","state":{}}')
$ok = $false
$detail = "status=$($r.Status)"
if ($r.Status -eq 409) {
  $b = $r.Body | ConvertFrom-Json
  $envKeys = @($b.PSObject.Properties.Name)
  $ok = ($envKeys -contains 'sha') -and ($envKeys -contains 'state')
  $detail = "status=409 conflictKeys=[$($envKeys -join ',')]"
} elseif ($r.Status -eq 200) {
  $detail = 'status=200 -- CAS BROKEN, remote state was overwritten with {} -- restore from data repo git history'
}
Check 'X  stale baseSha -> 409 + current content' $ok $detail

$key = $null
$sec = $null

Write-Host ''
Write-Host ('{0} passed, {1} failed' -f $script:pass, $script:fail)
if ($script:fail -eq 0) {
  Write-Host 'RESULT: PHASE 1 GATE PASSED' -ForegroundColor Green
} else {
  Write-Host 'RESULT: PHASE 1 GATE FAILED' -ForegroundColor Red
}
