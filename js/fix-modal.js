"use strict";
(function () {
  console.log('[fix-modal] 已加载');

  function _d0(d){var r=new Date(d);r.setHours(0,0,0,0);return r;}
  function _sameDay(a,b){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();}
  function _fmtDate(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}

  (function(){
    var _o=typeof openModal==='function'?openModal:null;
    var _t=setInterval(function(){if(typeof openModal==='function'){_o=openModal;clearInterval(_t);}},100);
    setTimeout(function(){clearInterval(_t);},5000);
    window.openModal=function(d,p){try{if(_o)_o(d,p);else if(typeof openModal==='function')openModal(d,p);}catch(e){}};
  })();

  window._handleModalMutation=function(){
    var _s=window._fixShared;if(!_s||_s.fixRunOnce)return;_s.fixRunOnce=true;
    var _mt=document.getElementById('modalMarkersTitle'),_ab=document.getElementById('modalAddMarkerBtn');
    if(_mt)_mt.style.display='none';
    if(_ab){
      _ab.style.display='inline-flex';_ab.style.alignItems='center';_ab.style.gap='4px';
      _ab.style.padding='4px 10px';_ab.style.margin='6px 0 0';_ab.style.fontSize='.65rem';
      _ab.style.border='none';_ab.style.background='var(--rose-light)';_ab.style.color='var(--rose-dark)';
      _ab.style.borderRadius='20px';_ab.style.cursor='pointer';
      _ab.innerHTML='➕ '+(typeof t==='function'?t('modalAddMarker'):'Dodaj oznaku');
      _ab.setAttribute('onclick','openEmojiPickerForModal()');
    }
    var _mb=document.getElementById('modal-mark-btn'),_ub=document.getElementById('modal-unmark-btn');
    if(_mb)_mb.style.display='none';if(_ub)_ub.style.display='none';
    var _sd=typeof selectedDate!=='undefined'?selectedDate:null;
    function _ic(d){
      if(!state||!state.records||!state.periodEnds)return false;
      for(var i=0;i<state.records.length;i++){var s=_d0(state.records[i]),ek=_fmtDate(state.records[i]),e=state.periodEnds[ek]?_d0(new Date(state.periodEnds[ek]+'T00:00:00')):null;if(e&&d>=s&&d<=e)return true;}
      return false;
    }
    function _bt(){
      if(!_sd)return null;var d=_d0(_sd);
      if(state&&state.records)for(var i=0;i<state.records.length;i++)if(_sameDay(state.records[i],d))return'❌ 移除记录';
      var os=typeof getOpenPeriodStart==='function'?getOpenPeriodStart():null;
      if(os&&_d0(os)<=d)return'⏹️ 结束本次经期';
      if(_ic(d))return null;return'\u{1F534} 标记经期开始';
    }
    var _pr=document.querySelector('.modal .info-row'),_nb=document.getElementById('fix-period-btn'),_tx=_bt();
    if(_tx===null&&_nb){_nb.style.display='none';}else if(_tx!==null){
      if(!_nb){
        _nb=document.createElement('button');_nb.id='fix-period-btn';
        _nb.style.display='block';_nb.style.width='100%';_nb.style.padding='12px 16px';_nb.style.margin='10px 0 6px';
        _nb.style.border='none';_nb.style.borderRadius='12px';_nb.style.fontSize='.88rem';_nb.style.fontWeight='700';
        _nb.style.cursor='pointer';_nb.style.color='#fff';_nb.style.transition='opacity .2s';
        _nb.onmouseover=function(){this.style.opacity='0.85';};_nb.onmouseout=function(){this.style.opacity='1';};
        _nb.onclick=function(){if(window._fixShared)window._fixShared.fixRunOnce=false;if(typeof togglePeriodRecord==='function')togglePeriodRecord();};
        if(_pr&&_pr.parentNode)_pr.parentNode.insertBefore(_nb,_pr.nextSibling);
        else{var _cb=document.getElementById('modal-close-btn');if(_cb&&_cb.parentNode)_cb.parentNode.insertBefore(_nb,_cb);}
      }else _nb.style.display='block';
      _nb.textContent=_tx;_nb.style.background=_tx.indexOf('⏹')>=0?'#E65100':_tx.indexOf('❌')>=0?'var(--rose)':'var(--love)';
    }
  };
})();
