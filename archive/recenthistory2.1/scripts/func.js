
/*
 * Copyright (c) 2011 Umar Sheikh
 *
 * This Google Chrome extension, Recent History, was made 
 * to be useful to users who want to access their history
 * in a better way. No warranty is expressed or implied 
 * and I accept no liability for any damages that may 
 * ensue from the usage of this extension.
 *
 * Attribution-Noncommercial-No Derivative Works 3.0 Unported
 * http://creativecommons.org/licenses/by-nc-nd/3.0/
 *
 */


// Version

function getVersion(){
  return '2.1';
}


// Version Type

function getVersionType(){
  return 'pageAction';
}


// Global vars

var ctrlState = 'false';
var shiftState = 'false';
var itemSelectedColor = '#ffcbd3';
var selectedItem;


// Google Analytics

if(window.navigator.platform == 'Win32'){
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-16300412-1']);
  _gaq.push(['_trackPageview']);
  (function() {
   var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
   ga.src = 'https://ssl.google-analytics.com/ga.js';
   (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(ga);
  })();
}


// Get url vars

function getUrlVars(){
  var vars = [], hash;
  var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  for(var i = 0; i < hashes.length; i++){
    hash = hashes[i].split('=');
    vars.push(hash[0]);
    vars[hash[0]] = hash[1];
  }
  return vars;
}


// Leap year

function isLeapYear(){
  var year = $('date-select-year').getSelected().get('value')*1;
  return (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0));
}


// Time

function timeNow(st){
  var tf = localStorage['rh-timeformat'];
  if(st == 0){
    var currentTime = new Date();
  }else{
    var currentTime = new Date(st);
  }
  var hours = currentTime.getHours()*1;
  var minutes = currentTime.getMinutes()*1;
  if(tf == '12'){
    if(hours > 11){
      var te = ' '+returnLang('PM');
    }else{
      var te = ' '+returnLang('AM');
    }
    if(hours == 0){
      hours = 12;
    }
    if(hours > 12){
      hours = hours-12;
    }
  }else if(tf == '24'){
    var te = '';
  }
  if(hours < 10){
    hours = '0'+hours;
  }
  if(minutes < 10){
    minutes = '0'+minutes;
  }
  return hours+':'+minutes+te;
}


// Format date

function formatDate(str){
  str = str*1;
  var datestr = localStorage['rh-date'];
  var date = new Date(str);
  var day = date.getDate()+'';
  var month = (date.getMonth()+1)+'';
  var year = date.getFullYear()+'';
  if(day.length == 1){day = '0'+day;}
  if(month.length == 1){month = '0'+month;}
  datestr = datestr.replace('dd', day);
  datestr = datestr.replace('mm', month);
  datestr = datestr.replace('yyyy', year);
  return datestr;
}


// Truncate

function truncate(str, ind, lng){
  if(str.length > lng){
    return str.substring(ind, lng)+'...'
  }else{
    return str.substring(ind, lng);
  }
}


// Open chrome URL

function chromeURL(url){
  chrome.tabs.create({
    url: url,
    selected: true
  });
}


// Echo lang

function echoLang(str){
  document.write(chrome.i18n.getMessage(str));
}


// Return lang

function returnLang(str){
  return chrome.i18n.getMessage(str);
}


// Copy text

Clipboard = {};
Clipboard.utilities = {};
Clipboard.utilities.createTextArea = function(value){
  var txt = document.createElement('textarea');
  txt.style.position = "absolute";
  txt.style.left = "-100%";
  if(value != null)
    txt.value = value;
  document.body.appendChild(txt);
  return txt;
};
Clipboard.copy = function(data){
  if(data == null) return;
  var txt = Clipboard.utilities.createTextArea(data);
  txt.select();
  document.execCommand('Copy');
  document.body.removeChild(txt);
  return false;
};


// Left click

function leftClick(url){
  
  new Event(event).stop();
  var ca = localStorage['rh-click'];
  var cs = ctrlState;
  if(cs == 'true' || event.button == 1){
    chrome.tabs.create({
      url: url,
      selected: false
    });
  }else{
    if(ca == 'current'){
      chrome.tabs.getSelected(null, function(tab){
        chrome.tabs.update(tab.id, {url: url}, function(){
          window.close();
        });
      });
    }else if(ca == 'newtab'){
      chrome.tabs.create({
        url: url,
        selected: true
      });
      window.close();
    }else if(ca == 'newbgtab'){
      chrome.tabs.create({
        url: url,
        selected: false
      });
    }
  }
}


// Right click

function rightClick(url){
  Clipboard.copy(url);
}


// Load Options lang

function loadOptionsLang(){
  $('save').set('value', returnLang('saveOptions'));
  $$('.help-tip').each(function(el){
    el.set('title', returnLang(el.get('id')));
  });
  new Tips('.help-tip');
}


// Load options

function loadOptions(){

  $('rhitemsno').set('value', localStorage['rh-itemsno']);
  $('rctitemsno').set('value', localStorage['rct-itemsno']);
  $('mvitemsno').set('value', localStorage['mv-itemsno']);
  $('rbitemsno').set('value', localStorage['rb-itemsno']);
  
  var rhilo = localStorage['rh-list-order'].split(',');
  
  for(var lo in rhilo){
    if(rhilo[lo] == 'rh-order'){
      new Element('li', {'id': rhilo[lo], 'html': returnLang('recentHistory')}).inject('rhlistorder');
    }else if(rhilo[lo] == 'rct-order'){
      new Element('li', {'id': rhilo[lo], 'html': returnLang('recentlyClosedTabs')}).inject('rhlistorder');
    }else if(rhilo[lo] == 'mv-order'){
      new Element('li', {'id': rhilo[lo], 'html': returnLang('mostVisited')}).inject('rhlistorder');
    }else if(rhilo[lo] == 'rb-order'){
      new Element('li', {'id': rhilo[lo], 'html': returnLang('recentBookmarks')}).inject('rhlistorder');
    }else if(rhilo[lo] == 'pinned-order'){
      new Element('li', {'id': rhilo[lo], 'html': returnLang('pinned')}).inject('rhlistorder');
    }
  }

  var rhos = new Sortables('#rhlistorder', {
    onStart: function(el){
      $$('#rhlistorder li').each(function(els){
        if(els !== el){
          els.setStyle('opacity', .4);
        }
      });
    },
    onComplete: function(el){
      $$('#rhlistorder li').setStyle('opacity', 1);
    }
  });
  
  $$('#rhhistorypage option[value="'+localStorage['rh-historypage']+'"]').set('selected', 'selected');
  $$('#rhdate option[value="'+localStorage['rh-date']+'"]').set('selected', 'selected');
  $$('#rhtime option[value="'+localStorage['rh-timeformat']+'"]').set('selected', 'selected');
  $$('#rhsearch option[value="'+localStorage['rh-search']+'"]').set('selected', 'selected');
  $$('#rhshare option[value="'+localStorage['rh-share']+'"]').set('selected', 'selected');
  
  $$('#rhsshowurl option[value="'+localStorage['rhs-showurl']+'"]').set('selected', 'selected');
  $$('#rhsshowsep option[value="'+localStorage['rhs-showsep']+'"]').set('selected', 'selected');
  $$('#rhsshowext option[value="'+localStorage['rhs-showext']+'"]').set('selected', 'selected');
  $$('#rhsshowbg option[value="'+localStorage['rhs-showbg']+'"]').set('selected', 'selected');
  
  previewItem();
  
  $('rhsshowurl').addEvent('change', function(){
    previewItem();
  });
  
  $('rhsshowsep').addEvent('change', function(){
    previewItem();
  });

  $('rhsshowext').addEvent('change', function(){
    previewItem();
  });
  
  $$('#rhicontype input[value="'+localStorage['rh-icontype']+'"]').setProperty('checked', 'checked');
  
  $('rhwidth').set('value', localStorage['rh-width'].toInt());
  
  $$('#rhtheme option[value="'+localStorage['rh-theme']+'"]').set('selected', 'selected');
  
  mostVisitedBlocklist();
  filteredDomainsList();
  
  $$('#rhclick option[value="'+localStorage['rh-click']+'"]').set('selected', 'selected');
  
}


// Load slider

function loadSlider(id, min, max, current){
  $(id).setStyle('text-align', 'right');
  var sone = new Slider(id+'-slider', id+'-slider-handle', {
    range: [min, max],
    snap: true,
    initialStep: localStorage[current].toInt(),
    onChange: function(pos){
      $(id).set('value', pos);
    }
  });
  $(id).addEvent('blur', function(){
    var cval = $(id).get('value')*1;
    if(cval >= min && cval <= max){
      sone.set(cval);
    }else{
      $(id).set('value', min);
      sone.set(min);
      alert(min+'-'+max);
    }
  });
  $(id).addEvent('keydown', function(e){
    if(e.event.keyCode == 40 && ($(id).get('value')*1) > min){
      $(id).set('value', ($(id).get('value')*1)-1);
      sone.set($(id).get('value'));
    }
  });
  $(id).addEvent('keydown', function(e){
    if(e.event.keyCode == 38 && ($(id).get('value')*1) < max){
      $(id).set('value', ($(id).get('value')*1)+1);
      sone.set($(id).get('value'));
    }
  });
}


// Save options

function saveOptions(){

  var so = {};
  var rhlo = $$('#rhlistorder li');
  var mli = $$('#mvlist tr td:first-child');
  var fli = $$('#flist tr td:first-child');
  var mlil = '';
  var flil = '';

  $('save').set('value', returnLang('saving'));

  if(mli.length > 0){
    for(m=0;m<mli.length;m++){
      mlil += mli[m].get('text')+'|';
    }
  }else{
    mlil = 'false';
  }
  
  if(fli.length > 0){
    for(f=0;f<fli.length;f++){
      flil += fli[f].get('text')+'|';
    }
  }else{
    flil = 'false';
  }

  so['rh-itemsno'] = $('rhitemsno').get('value');
  so['rct-itemsno'] = $('rctitemsno').get('value');
  so['rb-itemsno'] = $('rbitemsno').get('value');
  so['mv-itemsno'] = $('mvitemsno').get('value');
  so['rh-list-order'] = rhlo[0].get('id')+','+rhlo[1].get('id')+','+rhlo[2].get('id')+','+rhlo[3].get('id')+','+rhlo[4].get('id');
  so['rh-historypage'] = $('rhhistorypage').getSelected().get('value');
  so['rh-date'] = $('rhdate').getSelected().get('value');
  so['rh-timeformat'] = $('rhtime').getSelected().get('value');
  so['rh-search'] = $('rhsearch').getSelected().get('value');
  so['rh-share'] = $('rhshare').getSelected().get('value');
  so['rhs-showurl'] = $('rhsshowurl').getSelected().get('value');
  so['rhs-showsep'] = $('rhsshowsep').getSelected().get('value');
  so['rhs-showext'] = $('rhsshowext').getSelected().get('value');
  so['rhs-showbg'] = $('rhsshowbg').getSelected().get('value');
  so['rh-icontype'] = $$('#rhicontype input:checked')[0].get('value');
  so['rh-width'] = $('rhwidth').get('value')+'px';
  so['rh-theme'] = $('rhtheme').getSelected().get('value');
  so['mv-blocklist'] = mlil;
  so['rh-filtered'] = flil;
  so['rh-click'] = $('rhclick').getSelected().get('value');
  
  for(var i in so){
    localStorage[i] = so[i];
    console.log(i+'='+so[i]);
  }
  
  if(getVersionType() == 'pageAction'){
    chrome.windows.getAll({}, function(wins){
      for(var i in wins){
        if(wins[i].id !== undefined){
          chrome.tabs.getAllInWindow(wins[i].id, function(tabs){
            for(var n in tabs){
              if(tabs[n].id !== undefined){
                chrome.pageAction.setIcon({tabId: tabs[n].id, path: 'images/'+so['rh-icontype']+'.png'});
              }
            }
          });
        }
      }
    });
  }else if(getVersionType() == 'browserAction'){
    chrome.browserAction.setIcon({path: 'images/'+so['rh-icontype']+'.png'});
  }
  
  (function(){$('save').set('value', returnLang('saved'))}).delay(1500);
  (function(){$('save').set('value', returnLang('saveOptions'))}).delay(3000);

}


// Preview item

function previewItem(){
  var surl = $('rhsshowurl').getSelected().get('value');
  var ssep = $('rhsshowsep').getSelected().get('value');
  var sext = $('rhsshowext').getSelected().get('value');
  if(surl == 'yes'){
    $('rhitemstyle-url').setStyle('display', 'inline');
  }else{
    $('rhitemstyle-url').setStyle('display', 'none');
  }
  if(ssep == 'yes'){
    $('rhitemstyle').setStyle('border-bottom', '1px solid #ccc');
  }else{
    $('rhitemstyle').setStyle('border-bottom', '0 none');
  }
  if(sext == 'yes'){
    $('rhitemstyle-info').setStyle('display', 'inline');
  }else{
    $('rhitemstyle-info').setStyle('display', 'none');
  }
  if(sext == 'yes' && surl == 'yes'){
    $('rhitemstyle-sep').setStyle('display', 'inline');
  }else{
    $('rhitemstyle-sep').setStyle('display', 'none');
  }
}


// Most visited blocklist

function mostVisitedBlocklist(){
  var mvbl = localStorage['mv-blocklist'];
  if(mvbl.length > 0 && mvbl !== 'false'){
    mvbl = mvbl.split('|');
    if(mvbl.length > 0){
      for(i=0;i<mvbl.length;i++){
        if(mvbl[i] !== undefined && mvbl[i] !== ''){
          new Element('tr', {html: '<td><div title="'+mvbl[i]+'">'+mvbl[i]+'</div></td><td style="width:20px;"><a href="javascript:void(0);" onclick="this.getParent(\'tr\').destroy()"><img alt="Restore" src="images/remove.png"></a></td>', 'class': 'op-item'}).inject('mvlist-table');
        }
      }
    }
  }
}


// Filtered domains list

function filteredDomainsList(){
  var fbl = localStorage['rh-filtered'];
  if(fbl.length > 0 && fbl !== 'false'){
    fbl = fbl.split('|');
    if(fbl.length > 0){
      for(i=0;i<fbl.length;i++){
        if(fbl[i] !== undefined && fbl[i] !== ''){
          new Element('tr', {html: '<td><div title="'+fbl[i]+'">'+fbl[i]+'</div></td><td style="width:20px;"><a href="javascript:void(0);" onclick="this.getParent(\'tr\').destroy()"><img alt="Restore" src="images/remove.png"></a></td>', 'class': 'op-item'}).inject('flist-table');
        }
      }
    }
  }
}


// Add filtered item

function addFilteredItem(){
  var fliv = $('flist-add-i').get('value').replace(' ', '');
  var flic = 'test';
  if(fliv.length > 0){
    $$('#flist-table tr td:first-child').each(function(el){
      if(el.get('text') == fliv){
        flic = el.get('text');
      }
    });
    if(flic == 'test'){
      new Element('tr', {html: '<td><div title="'+fliv+'">'+fliv+'</div></td><td style="width:20px;"><a href="javascript:void(0);" onclick="this.getParent(\'tr\').destroy()"><img alt="Restore" src="images/remove.png"></a></td>', 'class': 'op-item'}).inject('flist-table');
      $('flist-add-i').set('value', '');
    }
  }
}


// Get twitter updates

function twitterUpdates(res){
  if(res.length > 0){
    $('twitter-insert').set('text', '');
    for(i=0;i<res.length;i++){
      var td = new Date(res[i].created_at);
      var date = 'Tweeted on '+td.getDate()+'/'+(td.getMonth()+1)+'/'+td.getFullYear();
      new Element('div', {html: '<div class="tweet-text">"'+res[i].text+'"</div><div class="tweet-date">'+date+'</div>', 'class': 'tweet'}).inject('twitter-insert');
    }
  }
}


// Popup search

function popupSearch(q){
  if(q !== '' && q !== undefined){
    chrome.history.search({text: q, maxResults: 30}, function(hi){
      if(hi.length > 0){
        $('popup-search-insert').set('text', '');
        for(i=0;i<=hi.length;i++){
          if(hi[i] !== undefined){
            var title = hi[i].title;
            var url = hi[i].url;
            var visits = hi[i].visitCount;
            var furl = 'chrome://favicon/'+hi[i].url;
            if(title !== ''){
              formatItem({type: 'rh', title: title, url: url, favicon: furl, visits: visits}).inject('popup-search-insert');
            }
          }
        }
        if(localStorage['rhs-showbg'] == 'yes'){
          isBookmarked('#popup-search-insert ');
          isPinned('#popup-search-insert ');
        }    
      }else{
        $('popup-search-insert').set('html', '<div class="no-results"><span>'+returnLang('noResults')+'</span></div>');
      }
    });
  }
}


// Is bookmarked

function isBookmarked(w){
  $$(w).each(function(el){
    chrome.bookmarks.search(el.get('href'), function(bms){
      if(bms.length > 0){
        for(var i in bms){
          if(bms[i].url == el.get('href')){
            if(w == '#rh-views .item .link'){
              if(el.getParent('div.item').getElement('span.bookmark')){
                el.getParent('div.item').getElement('span.bookmark').setStyle('background-image', 'url("images/star.png")');
              }
            }else{
              if(el.getStyle('background-color') !== '#ffffbd'){
                el.setStyle('background-color', '#ffffbd');
              }
            }
          }
        }
      }
    });
  });
}


// Is pinned

function isPinned(w){
  $$(w).each(function(el){
    var pi = JSON.decode(localStorage['rh-pinned']);
    if(pi.length > 0){
      for(var i in pi){
        if(pi[i] !== undefined){
          if(pi[i].url == el.get('href')){
            if(w == '#rh-views .item .link'){
              if(el.getParent('div.item').getElement('span.pin')){
                el.getParent('div.item').getElement('span.pin').setStyle('background-image', 'url("images/pin.png")');
              }
            }else{
              if(el.getStyle('background-color') !== '#f0fff1'){
                el.setStyle('background-color', '#f0fff1');
              }
            }
          }
        }
      }
    }
  });
}


// UI Edit items

function uiEditItems(type){
  if($$('#'+type+'-inject .edit-items-ui').length > 0){
    if($$('#'+type+'-inject .edit-items-ui')[0].getStyle('display') == 'none'){
      $$('#'+type+'-inject .edit-items-ui').setStyle('display', 'inline');
    }else if($$('#'+type+'-inject .edit-items-ui')[0].getStyle('display') == 'inline'){
      $$('#'+type+'-inject .edit-items-ui').setStyle('display', 'none');
    }
  }
}


// Alert user popup

function alertUser(msg, action){
  if(action == 'close'){
    $('alert-holder').setStyle('display', 'none');
    $('alert-yes').destroy();
    $('alert-no').destroy();
  }else if(action == 'open'){
    $('alert-holder').setStyle('display', 'block');
    $('alert-text').set('text', msg);
    new Element('input', {type: 'button', id: 'alert-yes', value: returnLang('yes')}).inject('alert');
    new Element('input', {type: 'button', id: 'alert-no', value: returnLang('no')}).inject('alert');
  }
}


// UI Pin item

function uiPinItem(el, type){
  alertUser(returnLang('ui1'), 'open');
  $('alert-no').addEvent('click', function(){
    alertUser('', 'close');
  });
  $('alert-yes').addEvent('click', function(){
    var url = el.getParent('a').get('href');
    var title = el.getParent('a').getChildren('span.title').get('text')[0].trim();
    var furl = el.getParent('a').getChildren('img')[0].get('src');
    var time = timeNow(0);
    var pi = localStorage['rh-pinned'];
    if(pi.indexOf('"'+url+'"') == -1){
      if(pi == 'false'){
        localStorage['rh-pinned'] = JSON.encode([{url: url, title: title, favicon: furl, time: time}]);
        $('pi-inject').setStyle('display', 'inline');
        if(type == 'rh'){
          $$('#rh-inject .item').destroy();
          recentHistory();
        }else if(type == 'rct'){
          $$('#rct-inject .item').destroy();
          recentlyClosedTabs();
        }else if(type == 'rb'){
          $$('#rb-inject .item').destroy();
          recentBookmarks();
        }else if(type == 'mv'){
          $$('#mv-inject .item').destroy();
          mostVisited();
        }
        pinned();
        alertUser('', 'close');
      }else{
        pi = JSON.decode(pi);
        pi.unshift({url: url, title: title, favicon: furl, time: time});
        localStorage['rh-pinned'] = JSON.encode(pi);
        if(type == 'rh'){
          $$('#rh-inject .item').destroy();
          recentHistory();
        }else if(type == 'rct'){
          $$('#rct-inject .item').destroy();
          recentlyClosedTabs();
        }else if(type == 'rb'){
          $$('#rb-inject .item').destroy();
          recentBookmarks();
        }else if(type == 'mv'){
          $$('#mv-inject .item').destroy();
          mostVisited();
        }
        $$('#pi-inject .item').destroy();
        pinned();
        alertUser('', 'close');
      }
    }
  });
}


// UI Delete item

function uiDeleteItem(el, type){
  if(type == 'rh'){
    alertUser(returnLang('ui2'), 'open');
  }else if(type == 'rct'){
    alertUser(returnLang('ui3'), 'open');
  }else if(type == 'rb'){
    alertUser(returnLang('ui4'), 'open');
  }else if(type == 'mv'){
    alertUser(returnLang('ui5'), 'open');
  }else if(type == 'pi'){
    alertUser(returnLang('ui6'), 'open');
  }
  $('alert-yes').addEvent('click', function(){
    var url = el.getParent('a').get('href');
    if(type == 'rh'){
      chrome.history.deleteUrl({url: url});
      $$('#rh-inject .item').destroy();
      recentHistory();
      alertUser('', 'close');
    }else if(type == 'rct'){
      var rct = chrome.extension.getBackgroundPage().closedTabs;
      for(var i in rct){
        if(rct[i] !== undefined && rct[i].url == url){
          rct.splice(i, 1);
          $$('#rct-inject .item').destroy();
          recentlyClosedTabs();
          if($$('#rct-inject .item').length == 0){
            $('rct-inject').setStyle('display', 'none');
          }
          alertUser('', 'close');
          break;
        }
      }
    }else if(type == 'rb'){
      chrome.bookmarks.search(url, function(bms){
        if(bms.length > 0){
          for(var i in bms){
            if(bms[i].url == url){
              chrome.bookmarks.remove(bms[i].id, function(){
                $$('#rb-inject .item').destroy();
                recentBookmarks();
                $$('#popup-insert .item').setStyle('background-color', 'transparent');
                isBookmarked('#rh-inject .item');
                isPinned('#rh-inject .item');
                isBookmarked('#rct-inject .item');
                isPinned('#rct-inject .item');
                if($$('#rb-inject .item').length == 0){
                  $('rb-inject').setStyle('display', 'none');
                }
                alertUser('', 'close');
              });
            }
          }
        }
      });
    }else if(type == 'mv'){
      var mv = localStorage['mv-blocklist'];
      if(mv == 'false'){
        localStorage['mv-blocklist'] = url+'|';
      }else{
        localStorage['mv-blocklist'] = localStorage['mv-blocklist']+url+'|';
      }
      $$('#mv-inject .item').destroy();
      mostVisited();
      alertUser('', 'close');
    }else if(type == 'pi'){
      var pi = JSON.decode(localStorage['rh-pinned']);
      var pl = pi.length;
      if(pl > 0){
        for(var i in pi){
          if(pi[i] !== undefined){
            if(pi[i].url == url){
              pi.splice(i, 1);
              if(pl == 1){
                localStorage['rh-pinned'] = 'false';
              }else{
                localStorage['rh-pinned'] = JSON.encode(pi);
              }
              $$('#pi-inject .item').destroy();
              pinned();
              if($$('#pi-inject .item').length == 0){
                $('pi-inject').setStyle('display', 'none');
              }
              $$('#popup-insert .item').setStyle('background-color', 'transparent');
              isBookmarked('#rh-inject .item');
              isPinned('#rh-inject .item');
              isBookmarked('#rct-inject .item');
              isPinned('#rct-inject .item');
              alertUser('', 'close');
            }
          }
        }
      }
    }
  });
  $('alert-no').addEvent('click', function(){
    alertUser('', 'close');
  });
}


// Format item

function formatItem(data){
  
  var item = '';
  var sobj = {};
  var rhsurl = localStorage['rhs-showurl'];
  var rhsext = localStorage['rhs-showext'];
  var rhssbg = localStorage['rhs-showbg'];
  
  var url = data.url;
  var type = data.type;
  var title = data.title.replace(/\"/g, '&#34;');
  var favicon = data.favicon;
  var time = data.time;

  if(data.visits !== undefined){
    var visits = data.visits;
  }else{
    var visits = '';
  }
  
  if(rhsurl == 'yes' || rhsext == 'yes'){
    var saext = 'style="margin-top:-3px;"';
  }else{
    var saext = '';
  }
  
  if(rhsext == 'no'){
    var sext = 'style="display:none;"';
  }else{
    if(type == 'rh' || type == 'mv'){
      var sext = '';
    }else{
      var sext = 'style="display:none;"';
    }
  }
  
  if(rhsurl == 'no'){
    var surl = 'style="display:none;"';
  }else{
    var surl = '';
  }
  
  if(localStorage['rhs-showsep'] == 'yes'){
    sobj['border-bottom'] = '1px solid #ccc';
  }
  
  if(rhsext == 'yes' && rhsurl == 'yes'){
    var extsep = ' | ';
  }else{
    var extsep = '';
  }
  
  var tip = '';
  if(title == url){
    tip = title;
  }else{
    tip = title+' | '+url;
  }
  if(time !== undefined){
    tip = tip+' | '+time;
  }
  
  if(type !== 'pi'){
    var ui = '<span class="ui-pin" onclick="uiPinItem(this, \''+type+'\')">&nbsp;</span><span class="ui-delete" onclick="uiDeleteItem(this, \''+type+'\')">&nbsp;</span>';
  }else{
    var ui = '<span class="ui-delete" onclick="uiDeleteItem(this, \''+type+'\')">&nbsp;</span>';
  }
  
  if(localStorage['rh-share'] == 'yes'){
    ui = ui+'<span class="ui-share" onclick="window.open(\'share.html?'+Hash.toQueryString({url: url, title: title.replace(/\'/g, '')})+'\', \''+returnLang('option21')+'\', \'width=600,height=350\')">&nbsp;</span>';
  }
  
  item += '<img onerror="this.setProperty(\'src\',\'images/blank.png\')" class="favicon" alt="Favicon" src="'+favicon+'">';
  item += '<span class="title" title="'+tip+'"><span class="edit-items-ui" onmouseover="this.getParent(\'a\').set(\'onclick\', \'return false\'); this.getParent(\'span\').set(\'title\', \'\')" onmouseout="this.getParent(\'a\').set(\'onclick\', \'leftClick(\\\''+url+'\\\')\'); this.getParent(\'span\').set(\'title\', \''+tip.replace(/\'/g, "\\'")+'\')">'+ui+'</span>'+title+'</span>';
  item += '<span '+saext+' class="extra-url"><span '+sext+' class="extra">'+returnLang("visits")+': '+visits+extsep+'</span><span '+surl+' class="url">'+url.replace(/^(.*?)\:\/\//, '').replace(/\/$/, '')+'</span></span>';
  
  return new Element('a', {
    onclick: 'leftClick(\''+url+'\')',
    oncontextmenu: 'rightClick(\''+url+'\')',
    'class': 'item',
    target: '_blank',
    styles: sobj,
    href: url,
    html: item
  });
  
}


// Recent History

function recentHistory(){

  var ir = 0;
  var rh = '';
  var rhin = localStorage['rh-itemsno']*1;
  var rhino = rhin;
  var flist = localStorage['rh-filtered'];
  rhin = rhin*4;
  
  if(rhin > 0){

    chrome.history.search({text: '', maxResults: rhin, startTime: (new Date()).getTime()-(28*24*3600*1000), endTime: (new Date()).getTime()}, function(hi){
    
      if(hi.length > 0){
      
        for(i=0;i<=hi.length;i++){
        
          if(ir == rhino){break;}
        
          if(hi[i] !== undefined){
          
            var title = hi[i].title;
            var url = hi[i].url;
            var visits = hi[i].visitCount;
            var furl = 'chrome://favicon/'+hi[i].url;
            var test = (/^(file|chrome|chrome-extension|chrome-devtools)\:\/\//).test(url);
            
            if(title == ''){
              title = url;
            }
            
            if(flist == 'false'){
            
              if(!test){
                formatItem({type: 'rh', title: title, url: url, favicon: furl, visits: visits, time: timeNow(hi[i].lastVisitTime)}).inject('rh-inject', 'bottom');
                ir++;
              }
            
            }else{
            
              var uri = new URI(url);
            
              if(flist.indexOf(uri.get('host')+'|') == -1){

                if(!test){
                  formatItem({type: 'rh', title: title, url: url, favicon: furl, visits: hi[i].visitCount, time: timeNow(hi[i].lastVisitTime)}).inject('rh-inject', 'bottom');
                  ir++;
                }              

              }
            
            }
            
          }

        }
        
        if(localStorage['rhs-showbg'] == 'yes'){
          isBookmarked('#rh-inject .item');
          isPinned('#rh-inject .item');
        }
                
      }

    });
  
  }

}


// Recently Closed Tabs

function recentlyClosedTabs(){

  var rhhistory = chrome.extension.getBackgroundPage().closedTabs;

  var itemsno = localStorage['rct-itemsno']*1;
  var flist = localStorage['rh-filtered'];
  var rcti = 0;
  
  if(itemsno > 0){

    if(rhhistory.length > 0){

      for(i=0;i<99;i++){
      
        if(itemsno == rcti){break;}
      
        if(rhhistory[i] !== undefined){
          
          var title = rhhistory[i].title;
          var url = rhhistory[i].url;
          var time = rhhistory[i].time;
          var furl = 'chrome://favicon/'+rhhistory[i].url;
          
          if(title == ''){
            title = url;
          }
          
          if(title !== undefined){
            if(!(/^(file|chrome|chrome-extension|chrome-devtools)\:\/\//).test(url)){
              if(rhhistory[(i-1)] == undefined){
                var uri = new URI(url);
                if(flist.indexOf(uri.get('host')+'|') == -1){
                  formatItem({type: 'rct', title: title, url: url, favicon: furl, time: time}).inject('rct-inject', 'bottom');
                  rcti++;
                }
              }else{
                if(rhhistory[(i-1)].url !== url){
                  var uri = new URI(url);
                  if(flist.indexOf(uri.get('host')+'|') == -1){
                    formatItem({type: 'rct', title: title, url: url, favicon: furl, time: time}).inject('rct-inject', 'bottom');
                    rcti++;
                  }
                }
              }
            }
          }
        
        }
      
      }
      
      if($$('#rct-inject .item').length == 0){
        $('rct-inject').setStyle('display', 'none');
      }
      
      if(localStorage['rhs-showbg'] == 'yes'){
        isBookmarked('#rct-inject .item');
        isPinned('#rct-inject .item');
      }
        
    }
  
  }

}


// Most Visited

function mostVisited(){

  var mvc = localStorage['mv-cache'];
  
  if(mvc !== 'false'){
    
    var mvd = JSON.decode(mvc);
    var itemsno = localStorage['mv-itemsno']*1;
    var mvrl = localStorage['mv-blocklist'];
    var r = 0;
    
    for(i=0;i<45;i++){
    
      if(r == itemsno){
        break;
      }
    
      if(mvd[i].title !== undefined){
        if(mvrl.indexOf(mvd[i].url+'|') == -1){
          formatItem({type: 'mv', url: mvd[i].url, favicon: mvd[i].favicon, title: mvd[i].title, visits: mvd[i].visitCount}).inject('mv-inject', 'bottom');
          r++;
        }
      }
      
    }
      
  }

}


// Recent Bookmarks

function recentBookmarks(){

  var rbin = localStorage['rb-itemsno']*1;

  if(rbin > 0){

    chrome.bookmarks.getRecent(rbin, function(bm){
    
      if(bm.length > 0){
      
        for(i=0;i<=bm.length;i++){
        
          if(bm[i] !== undefined){
          
            var title = bm[i].title;
            var url = bm[i].url;
            var furl = 'chrome://favicon/'+bm[i].url;
            
            if(title == ''){
              title = url;
            }
            
            formatItem({type: 'rb', url: url, title: title, favicon: furl, time: formatDate(bm[i].dateAdded)}).inject('rb-inject', 'bottom');

          }

        }
              
      }

    });
  
  }

}


// Pinned

function pinned(){

  var pc = localStorage['rh-pinned'];
  
  if(pc !== 'false'){
    
    var pd = JSON.decode(pc);
    
    for(i=0;i<99;i++){
    
      if(pd[i] !== undefined){
        formatItem({type: 'pi', url: pd[i].url, favicon: pd[i].favicon, title: pd[i].title, time: pd[i].time}).inject('pi-inject', 'bottom');
      }
      
    }
      
  }

}


// Alert user history

function alertUserHistory(){
  if($('alert-holder').getStyle('display') == 'block'){
    $('alert-holder').setStyle('display', 'none');
    $('pacman-iframe').set('src', '');
  }else if($('alert-holder').getStyle('display') == 'none'){
    $('alert-holder').setStyle('display', 'block');
    $('pacman-iframe').set('src', 'pacman/index.html');
  }
}


// Date picker

function calendar(w, e){

  if(isLeapYear()){
    var dayarray = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  }else{
    var dayarray = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  }

  if(w == 'current'){
    var cdateo = new Date();
  }else if('selected'){
    var mcheck = dayarray[($('date-select-month').getSelected().get('value')*1-1)];
    var dcheck = ($('date-select-day').getSelected().get('value')*1);
    if(mcheck < dcheck){
      var cdateo = new Date(($('date-select-year').getSelected().get('value')*1), ($('date-select-month').getSelected().get('value')*1-1), mcheck, 23, 59, 59, 999);
    }else{
      var cdateo = new Date(($('date-select-year').getSelected().get('value')*1), ($('date-select-month').getSelected().get('value')*1-1), ($('date-select-day').getSelected().get('value')*1), 23, 59, 59, 999);
    }
  }
  
  if(e == 'prev'){
    cdateo.setDate(cdateo.getDate()-1);
  }else if(e == 'next'){
    cdateo.setDate(cdateo.getDate()+1);
  }
    
  $('date-select-day').set('html', '');
  var ydatec = new Date().getFullYear();
  var mdatec = cdateo.getMonth();
  var ddatec = cdateo.getDate();
  var yeararray = [ydatec, (ydatec-1)];
  
  if(w == 'current'){
    for(i=0;i<yeararray.length;i++){
      if(i == 0){
        new Element('option', {'value': yeararray[i], 'selected': 'selected', 'text': yeararray[i]}).inject('date-select-year');
      }else{
        new Element('option', {'value': yeararray[i], 'text': yeararray[i]}).inject('date-select-year');
      }
    }
  }
  
  $$('#date-select-month option').each(function(el){
    if((mdatec)+1 == (el.get('value')*1)){
      el.set('selected', 'selected');
    }
  });
  
  for(i=0;i<=dayarray.length;i++){
    if(mdatec == i){
      for(ia=1;ia<=dayarray[i];ia++){
        if(ia == ddatec){
          ia = ia+'';
          if(ia.length == 1){
            ia = '0'+ia;
          }
          new Element('option', {'value': ia, 'selected': 'selected', 'text': ia}).inject('date-select-day');
        }else{
          ia = ia+'';
          if(ia.length == 1){
            ia = '0'+ia;
          }
          new Element('option', {'value': ia, 'text': ia}).inject('date-select-day');
        }
      }
    }
  }
  
  var fday = new Date(ydatec, mdatec, 1, 23, 59, 59, 999).getDay();
  var lday = new Date(ydatec, mdatec, dayarray[mdatec], 23, 59, 59, 999).getDay();
  
  $('calendar-days').set('text', '');
  
  for(ii=0;ii<dayarray[mdatec];ii++){
    if(ii == 0){
      for(d=0;d<fday;d++){
        new Element('span', {html: '&nbsp;', 'class': 'day'}).inject('calendar-days');
      }
    }
    if((ii+1) == ddatec){
      new Element('a', {
        id: 'selected',
        href: 'javascript:void(0)',
        rel: (ii+1)+'|'+(mdatec+1)+'|'+ydatec,
        text: (ii+1),
        'class': 'day',
        events: {
          click: function(){
            var cel = this;
            $$('#date-select-day option').each(function(el){
              if(el.get('value').toInt() == cel.get('text').toInt()){
                el.set('selected', 'selected');
              }else{
                el.set('selected', '');
              }
            });
            $$('#calendar-days a#selected').removeProperty('id');
            cel.set('id', 'selected');
            history('yes', '');
          }
        }
      }).inject('calendar-days');
    }else{
      new Element('a', {
        href: 'javascript:void(0)',
        text: (ii+1),
        'class': 'day',
        events: {
          click: function(){
            var cel = this;
            $$('#date-select-day option').each(function(el){
              if(el.get('value').toInt() == cel.get('text').toInt()){
                el.set('selected', 'selected');
              }else{
                el.set('selected', '');
              }
            });
            $$('#calendar-days a#selected').removeProperty('id');
            cel.set('id', 'selected');
            history('yes', '');
          }
        }
      }).inject('calendar-days');
    }
    if((ii+1) == dayarray[mdatec]){
      for(d=0;d<(6-lday);d++){
        new Element('span', {html: '&nbsp;', 'class': 'day'}).inject('calendar-days');
      }
    }
  }

}


// History

function history(w, q){

  var sw = $('rh-what').getSelected().get('value');
  var grp = localStorage['rh-group'];
  var oby = localStorage['rh-orderby'];
  var ord = localStorage['rh-order'];
  var obj = {};
  var rha = [];
  var test = {};
  
  if(w == 'yes' || w == 'current'){
    if(w == 'yes'){
      var day = ($('date-select-day').getSelected().get('value')*1);
      var month = ($('date-select-month').getSelected().get('value')*1-1);
      var year = ($('date-select-year').getSelected().get('value')*1);
      var today = new Date(year, month, day, 23, 59, 59, 999);
    }else if(w == 'current'){
      var ndc = new Date();
      var today = new Date(ndc.getFullYear(), ndc.getMonth(), ndc.getDate(), 23, 59, 59, 999);
    }
    var eTime = today.getTime();
    obj['startTime'] = (eTime-86400000);
    obj['endTime'] = today.getTime();
    obj['maxResults'] = 999;
    obj['text'] = '';
    var into = 'rh-views-insert';
    $('rh-views-search-insert').setStyle('display', 'none');
    $('rh-views-insert').setStyle('display', 'block');
    $('rh-search').set('value', '');
    $('delete-range-one').set('value', formatDate(eTime));
    $('delete-range-two').set('value', formatDate(eTime));
  }else if(w == 'search'){
    if(sw == 'current'){
      var day = ($('date-select-day').getSelected().get('value')*1);
      var month = ($('date-select-month').getSelected().get('value')*1-1);
      var year = ($('date-select-year').getSelected().get('value')*1);
      var ndate = new Date(year, month, day, 23, 59, 59, 999);
      var eTime = ndate.getTime();
      var sTime = (eTime-86400000);
      obj['startTime'] = sTime;
      obj['endTime'] = ndate.getTime();
    }else if(sw == 'all'){
      obj['startTime'] = (new Date()).getTime()-(28*24*3600*1000);
      obj['endTime'] = (new Date()).getTime();
    }else if(sw == 'recent'){
      // Do not set anything
    }
    obj['text'] = q;
    obj['maxResults'] = 100;
    var into = 'rh-views-search-insert';
    $('rh-views-search-insert').setStyle('display', 'block');
    $('rh-views-insert').setStyle('display', 'none');
  }

  $(into).set('text', returnLang('loading'));

  chrome.history.search(obj, function(hi){
  
    if(hi.length > 0){
      
      for(i=0;i<=hi.length;i++){
        
        if(hi[i] !== undefined && (/^(http|https|ftp|ftps)\:\/\//).test(hi[i].url)){
        
          var title = hi[i].title;
          var url = hi[i].url;
          var visits = hi[i].visitCount;
          var furl = 'chrome://favicon/'+hi[i].url;
          
          if(title == ''){
            title = url;
          }
          
          rha.push({url: url, host: (new URI(url).get('host')), time: timeNow(hi[i].lastVisitTime), date: formatDate(hi[i].lastVisitTime), favicon: furl, title: truncate(title, 0, 100), visits: visits});
          
        }

      }
      
      if(rha.length > 0){
      
        if(into == 'rh-views-insert'){
          var rhat = rha.length;
          $('calendar-total-value').set('text', rhat);
          if(rhat == 0 || rhat < 50){
            $$('#calendar a#selected').setStyle('background-color', '#daf3cb');
          }else if(rhat > 49 && rhat < 100){
            $$('#calendar a#selected').setStyle('background-color', '#aade8a');
          }else if(rhat > 99 && rhat < 150){
            $$('#calendar a#selected').setStyle('background-color', '#6dc738');
            $$('#calendar a#selected').setStyle('color', '#fff');
          }else{
            $$('#calendar a#selected').setStyle('background-color', '#4e991f');
            $$('#calendar a#selected').setStyle('color', '#fff');
          }
        }
        
        if(oby == 'title'){
          rha.sort(function(a, b){
            if(grp == 'yes'){
              var nameA = a.host.replace('www.', '');
              var nameB = b.host.replace('www.', '');
            }else if(grp == 'no'){
              var nameA = a.title;
              var nameB = b.title;
            }
            if(nameA < nameB){
              return -1;
            }else if(nameA > nameB){
              return 1;
            }else{
              return 0;
            }
          });
        }
        
        if(ord == 'asc'){
          rha.reverse();
        }
        
        $(into).set('text', '');
        
        var ibcb = '#f1f1f1';
        var ibcv = 'grey';
        
        for(ii=0;ii<=rha.length;ii++){
          if(rha[ii] !== undefined){
            if(grp == 'yes'){
              if(!$(into).getElement('div[rel="'+rha[ii].host+'"]')){
                new Element('div', {title: rha[ii].host, rel: ibcv, styles: {'background-color': ibcb}, 'class': 'item-holder group-title', html: '<a href="javascript:void(0)" class="group-title-toggle" onclick="toggleGroup(\''+rha[ii].host+'\')" rel="'+rha[ii].host+'"></a><input type="checkbox" class="group-title-checkbox" onclick="getMoreItems(this)" value="'+rha[ii].host+'"><img onerror="this.setProperty(\'src\',\'images/blank.png\')" class="group-title-favicon" alt="Favicon" src="'+rha[ii].favicon+'"><span onclick="toggleGroup(\''+rha[ii].host+'\')" class="group-title-host">'+rha[ii].host.replace('www.', '')+'</span>'}).inject(into);
                new Element('div', {'class': 'group-holder', rel: rha[ii].host, styles: {'display': 'none'}}).inject(into);
                if(ibcb == '#fff'){
                  ibcb = '#f1f1f1';
                }else{
                  ibcb = '#fff';
                }
                if(ibcv == 'white'){
                  ibcv = 'grey';
                }else{
                  ibcv = 'white';
                }
              }
              if(w == 'search' && (sw == 'all' || sw == 'recent')){
                rha[ii].time = '- - : - -';
              }
              var item = '';
              item = '<div class="item">';
              item += '<span class="checkbox"><label><input class="chkbx" type="checkbox" onclick="selectHistoryItem(this, \'single\')" value="'+rha[ii].url+'" name="check"></label>&nbsp;</span>';
              item += '<span class="bookmark">&nbsp;</span>';
              item += '<span class="time">'+rha[ii].time+'</span>';
              item += '<a style="padding-left:0;" target="_blank" class="link" href="'+rha[ii].url+'">';
              item += '<span class="title" title="'+rha[ii].url+'" rel="'+returnLang('visits')+': '+rha[ii].visits+' | '+rha[ii].time+' '+rha[ii].date+'">'+rha[ii].title+'</span>';
              item += '</a>';
              item += '</div>';
              new Element('div', {'rel': $(into).getElement('div.item-holder[title="'+rha[ii].host+'"]').get('rel'), 'class': 'item-holder', styles: {'background-color': $(into).getElement('div.item-holder[title="'+rha[ii].host+'"]').getStyle('background-color')}}).set('html', item+'<div class="clearitem" style="clear:both;"></div>').inject($(into).getElement('div[rel="'+rha[ii].host+'"]'));
            }else if(grp == 'no'){
              if(w == 'search' && (sw == 'all' || sw == 'recent')){
                rha[ii].time = '- - : - -';
              }
              var item = '';
              item = '<div class="item">';
              item += '<span class="checkbox"><label><input class="chkbx" type="checkbox" onclick="selectHistoryItem(this, \'single\')" value="'+rha[ii].url+'" name="check"></label>&nbsp;</span>';
              item += '<span class="bookmark">&nbsp;</span>';
              item += '<span class="time">'+rha[ii].time+'</span>';
              item += '<a target="_blank" class="link" href="'+rha[ii].url+'">';
              item += '<img onerror="this.setProperty(\'src\',\'images/blank.png\')" class="favicon" alt="Favicon" src="'+rha[ii].favicon+'">';
              item += '<span class="title" title="'+rha[ii].url+'" rel="'+returnLang('visits')+': '+rha[ii].visits+' | '+rha[ii].time+' '+rha[ii].date+'">'+rha[ii].title+'</span>';
              item += '</a>';
              item += '</div>';
              new Element('div', {'rel': ibcv, 'class': 'item-holder', styles: {'background-color': ibcb}}).set('html', item+'<div class="clearitem" style="clear:both;"></div>').inject(into);
              if(ibcb == '#fff'){
                ibcb = '#f1f1f1';
              }else{
                ibcb = '#fff';
              }
              if(ibcv == 'white'){
                ibcv = 'grey';
              }else{
                ibcv = 'white';
              }
            }
          }
        }
              
        isBookmarked('#rh-views .item .link');
        
        $(document.body).getElement('#rh-bar-uione input').set('checked', false);
        
        selectedItem = undefined;
        
        new Tips('.title', {
          className: 'tip-holder'
        });
        
        if($$('#'+into+' div.group-title').length > 0){
          toggleGroup($$('#'+into+' div.group-title')[0].get('title'));
        }
      
      }else{
        $(into).set('html', '<div class="no-results"><span>'+returnLang('noResults')+'</span></div>');
      }
      
    }else{
      $(into).set('html', '<div class="no-results"><span>'+returnLang('noResults')+'</span></div>');
    }

  });
  
}


// Toggle group

function toggleGroup(host){
  if(getActiveHistory() == 'history'){
    var into = 'rh-views-insert';
  }else if(getActiveHistory() == 'search'){
    var into = 'rh-views-search-insert';
  }
  var tgda = $(into).getElement('a[rel="'+host+'"]');
  var tgde = $(into).getElement('div[rel="'+host+'"]');
  var tgdv = tgde.getStyle('display');
  if(tgdv == 'block'){
    tgde.setStyle('display', 'none');
    tgda.setStyle('background-position', 'left center');
  }else{
    tgde.setStyle('display', 'block');
    tgda.setStyle('background-position', 'right center');
  }
}


// Get active history

function getActiveHistory(){
  if($('rh-views-insert').getStyle('display') == 'block'){
    return 'history';
  }else if($('rh-views-search-insert').getStyle('display') == 'block'){
    return 'search';
  }
}


// Get more items

function getMoreItems(el){
  if(getActiveHistory() == 'history'){
    var into = '#rh-views-insert';
  }else if(getActiveHistory() == 'search'){
    var into = '#rh-views-search-insert';
  }
  var ihost = el.get('value');
  if(el.get('checked') == false){
    $$(into+' .chkbx').each(function(ele){
      var eleh = new URI(ele.get('value')).get('host');
      if(ihost == eleh){
        ele.set('checked', false);
        if(ele.getParent('div.item-holder').get('rel') == 'white'){
          ele.getParent('div.item-holder').setStyle('background-color', '#fff');
          el.getParent('div.group-title').setStyle('background-color', '#fff');
        }else{
          ele.getParent('div.item-holder').setStyle('background-color', '#f1f1f1');
          el.getParent('div.group-title').setStyle('background-color', '#f1f1f1');
        }
      }
    });
  }else if(el.get('checked') == true){
    $$(into+' .chkbx').each(function(ele){
      var eleh = new URI(ele.get('value')).get('host');
      if(ihost == eleh){
        ele.set('checked', true);
        el.getParent('div.group-title').setStyle('background-color', itemSelectedColor);
        selectHistoryItem(ele, 'single');
      }
    });
  }
  if($$(into+' .chkbx').length == $$(into+' .chkbx:checked').length){
    $('master-check-all').set('checked', true);
    $('master-check-all').set('value', 'true');
  }else{
    $('master-check-all').set('checked', false);
    $('master-check-all').set('value', 'false');
  }
}


// Reset color

function resetColor(){
  if(getActiveHistory() == 'history'){
    var into = '#rh-views-insert';
  }else if(getActiveHistory() == 'search'){
    var into = '#rh-views-search-insert';
  }
  $$(into+' .item-holder').each(function(el){
    if(el.get('rel') == 'grey'){
      el.setStyle('background-color', '#f1f1f1');
    }else if(el.get('rel') == 'white'){
      el.setStyle('background-color', '#fff');
    }
    if(el.getElement('input.chkbx').get('checked') == true){
      el.setStyle('background-color', itemSelectedColor);
    }
  });
}


// Select history item

function selectHistoryItem(el, w){
  var grp = localStorage['rh-group'];
  if(getActiveHistory() == 'history'){
    var into = '#rh-views-insert';
  }else if(getActiveHistory() == 'search'){
    var into = '#rh-views-search-insert';
  }
  if(w == 'single'){
    if(el.get('checked') == true){
      if(shiftState == 'true' && selectedItem !== undefined){
        var hitState = 'false';
        var chkbxs = $$(into+' .chkbx');
        for(i=0;i<chkbxs.length;i++){
          if(chkbxs[i] == el || chkbxs[i] == selectedItem){
            if(hitState == 'false'){
              hitState = 'true';
            }else if(hitState == 'true'){
              hitState = 'false';
            }
          }
          if(hitState == 'true' && chkbxs[i] !== el && chkbxs[i] !== selectedItem){
            if(chkbxs[i].get('checked') == true){
              chkbxs[i].set('checked', false);
              if(chkbxs[i].getParent('div.item-holder').get('rel') == 'white'){
                chkbxs[i].getParent('div.item-holder').setStyle('background-color', '#fff');
              }else{
                chkbxs[i].getParent('div.item-holder').setStyle('background-color', '#f1f1f1');
              }
            }else if(chkbxs[i].get('checked') == false){
              chkbxs[i].set('checked', true);
              chkbxs[i].getParent('div.item-holder').setStyle('background-color', itemSelectedColor);
            }
          }
        }
      }
      selectedItem = el;
      el.getParent('div.item-holder').setStyle('background-color', itemSelectedColor);
    }else if(el.get('checked') == false){
      selectedItem = undefined;
      var iurl = el.get('value');
      $$(into+' .chkbx').each(function(ele){
        if(ele.get('value') == iurl){
          if(ele.getParent('div.item-holder').get('rel') == 'white'){
            ele.getParent('div.item-holder').setStyle('background-color', '#fff');
          }else{
            ele.getParent('div.item-holder').setStyle('background-color', '#f1f1f1');
          }
        }
      });
    }
    if($$(into+' .chkbx').length == $$(into+' .chkbx:checked').length){
      $('master-check-all').set('checked', true);
      $('master-check-all').set('value', 'true');
    }else{
      $('master-check-all').set('checked', false);
      $('master-check-all').set('value', 'false');
    }
    if(grp == 'yes'){
      var elem = el.getParent('.group-holder');
      if(elem.getElements('.chkbx').length == elem.getElements('.chkbx:checked').length){
        $$(into+' div[title="'+elem.get('rel')+'"]')[0].setStyle('background-color', itemSelectedColor);
        $$(into+' div[title="'+elem.get('rel')+'"]')[0].getElement('.group-title-checkbox').set('checked', true);
      }else{
        if($$(into+' div[title="'+elem.get('rel')+'"]')[0].get('rel') == 'grey'){
          $$(into+' div[title="'+elem.get('rel')+'"]')[0].setStyle('background-color', '#f1f1f1');
          $$(into+' div[title="'+elem.get('rel')+'"]')[0].getElement('.group-title-checkbox').set('checked', false);
        }else if($$(into+' div[title="'+elem.get('rel')+'"]')[0].get('rel') == 'white'){
          $$(into+' div[title="'+elem.get('rel')+'"]')[0].setStyle('background-color', '#fff');
          $$(into+' div[title="'+elem.get('rel')+'"]')[0].getElement('.group-title-checkbox').set('checked', false);
        }
      }
    }
  }else if(w == 'all'){
    if(el.get('value') == 'false'){
      $$(into+' .chkbx').each(function(ele){
        ele.set('checked', true);
        ele.getParent('div.item-holder').setStyle('background-color', itemSelectedColor);
      });
      if(grp == 'yes'){
        $$(into+' .group-title').each(function(gel){
          gel.getElement('input').set('checked', true);
          gel.setStyle('background-color', itemSelectedColor);
        });
      }
      el.set('value', 'true');
    }else{
      $$(into+' .chkbx').each(function(ele){
        ele.set('checked', false);
        if(ele.getParent('div.item-holder').get('rel') == 'white'){
          ele.getParent('div.item-holder').setStyle('background-color', '#fff');
        }else{
          ele.getParent('div.item-holder').setStyle('background-color', '#f1f1f1');
        }
      });
      if(grp == 'yes'){
        $$(into+' .group-title').each(function(gel){
          gel.getElement('input').set('checked', false);
          if(gel.get('rel') == 'white'){
            gel.setStyle('background-color', '#fff');
          }else{
            gel.setStyle('background-color', '#f1f1f1');
          }
        });
      }
      el.set('value', 'false');
    }
  }
}


// Delete history item

function deleteHistoryItem(w){
  if(w == 'selected'){
    var grp = localStorage['rh-group'];
    if(getActiveHistory() == 'history'){
      var into = '#rh-views-insert';
    }else if(getActiveHistory() == 'search'){
      var into = '#rh-views-search-insert';
    }
    if($$(into+' .checkbox input:checked').length > 0){
      $$('title').set('text', 'Deleting...');
      alertUserHistory();
      (function(){
        $('alert-holder-loading').setStyle('margin-top', '36px');
        $('pacman-iframe').setStyle('display', 'block');
      }).delay(3000);
      $$(into+' .checkbox input:checked').each(function(el){
        el.getParent('div.item-holder').destroy();
        chrome.history.deleteUrl({url: el.get('value')});
      });
      chrome.history.search({text: '', maxResults: 1, startTime: (new Date()).getTime()-(1*24*3600*1000), endTime: (new Date()).getTime()}, function(hi){
        if(grp == 'yes'){
          $$(into+' .group-holder').each(function(gel){
            if(gel.getChildren('div.item-holder').length == 0){
              $$(into+' .group-title[title="'+gel.get('rel')+'"]').destroy();
              gel.destroy();
            }
          });
        }
        $$('title').set('text', 'History | Recent History');
        alertUserHistory();
        $('alert-holder-loading').setStyle('margin-top', '-15px');
        $('pacman-iframe').setStyle('display', 'none');
      });
    }
  }else if(w == 'range'){
    var df = localStorage['rh-date'];
    var sr = $('delete-range-one').get('value').split('/');
    var er = $('delete-range-two').get('value').split('/');
    if(df == 'dd/mm/yyyy'){
      var startRange = new Date(sr[2], (sr[1]-1), sr[0], 23, 59, 59, 999).getTime()-86400000;
      var endRange = new Date(er[2], (er[1]-1), er[0], 23, 59, 59, 999).getTime();
    }else if(df == 'mm/dd/yyyy'){
      var startRange = new Date(sr[2], (sr[0]-1), sr[1], 23, 59, 59, 999).getTime()-86400000;
      var endRange = new Date(er[2], (er[0]-1), er[1], 23, 59, 59, 999).getTime();
    }else if(df == 'yyyy/mm/dd'){
      var startRange = new Date(sr[0], (sr[1]-1), sr[2], 23, 59, 59, 999).getTime()-86400000;
      var endRange = new Date(er[0], (er[1]-1), er[2], 23, 59, 59, 999).getTime();
    }
    if(startRange < endRange){
      $$('title').set('text', 'Deleting...');
      alertUserHistory();
      (function(){
        $('alert-holder-loading').setStyle('margin-top', '36px');
        $('pacman-iframe').setStyle('display', 'block');
      }).delay(3000);
      chrome.history.deleteRange({startTime: startRange, endTime: endRange}, function(){
        calendar('yes', '');
        history('yes', '');
        $$('title').set('text', 'History | Recent History');
        alertUserHistory();
        $('alert-holder-loading').setStyle('margin-top', '-15px');
        $('pacman-iframe').setStyle('display', 'none');
      });
    }
  }
}
