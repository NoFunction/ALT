// ==UserScript==
// @name         AtvinnuLeitarTól
// @namespace    http://skari.is/
// @version      1.0
// @description  Auðveldar leit að vinnu á tvinna.is, alfred.is, reykjavik.is, job.is og starfatorg.is.
// @author       Óskar Ragnarsson
// @match        http://*.tvinna.is/*
// @match        https://*.alfred.is/*
// @match        http://*.reykjavik.is/laus-storf*
// @match        http://job.visir.is/*
// @match        http://*.job.is/*
// @match        https://*.starfatorg.is/*
// @require      https://code.jquery.com/jquery-3.1.1.min.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// ==/UserScript==

var host = document.location.hostname.replace(/^www\./i, '').toLowerCase(), timer;

function wait(cond, func) {
 if ((typeof cond == 'string' && eval(cond)) || (typeof cond == 'function' && cond())) return (typeof func == 'function' && func());
 timer = setTimeout(function () { wait(cond, func); }, 100);
}

switch (host) {
 case 'alfred.is':
  GM_addStyle('#button-container { position: relative; top: -22px; text-align: center;; }');
  GM_addStyle('#save-position { color: #FF7200; background-color: #fff; font-weight: 700; padding: 5px 20px; border-radius: 20px; }');
  GM_addStyle('.target { border: 1px solid #36C1EB !important; border-radius: 20px !important; }');
  var jobs_href = document.location.href.match(/starfsgrein\/+(\d+)/i);
  var jobs_type = jobs_href ? jobs_href.pop() : 0;
  wait(
   function () {
    return $('header .row.categories a').length;
   },
   function () {
    $('header .row.categories a').removeClass('ember-view');
    $('header .container').last().append('<div id="button-container"></div>');
    $('#button-container').append('<a href="#" id="save-position">Vista stöðu</a>');
    $('#save-position').click(function () {
     var target = $('#jobs a').first().attr('href').match(/\/(\d+)/i).pop();
     GM_setValue('target-alfred-' + jobs_type, target);
     $('.target').removeClass('target');
     $('#jobs a').first().addClass('target');
     return false;
    });
    var target = GM_getValue('target-alfred-' + jobs_type, GM_getValue('target-alfred-0'));
    if (target) {
     $('a[href*="' + target + '"]').addClass('target');
    }
    return false;
   }
  );
  break;
 case 'tvinna.is':
  GM_addStyle('.target { border-color: #f00 !important; }');
  GM_addStyle('.target h2 { color: #f00 !important; }');
  $('ul.navigation').append('<li><a href="#" id="save-position">Vista stöðu</a></li>');
  $('#save-position').click(function () {
   var target = $('.job-listing ul li').first().find('a').attr('href').match(/([^/]+)\/?$/i).pop();
   GM_setValue('target-tvinna', target);
   $('.target').removeClass('target');
   $('.job-listing ul li').first().addClass('target');
  });
  var target = GM_getValue('target-tvinna');
  if (target) {
   $('a[href*="' + target + '"]').parents('li').addClass('target');
  }
  return false;
  break;
 case 'reykjavik.is':
  GM_addStyle('#jobs-filter-form { display: none; }');
  GM_addStyle('#jobs-filter-save { margin: 10px 0px; }');
  GM_addStyle('#jobs-filter-cancel { margin-left: 10px; }');
  GM_addStyle('#jobs-status-info { font-style: italic; margin-bottom: 10px; }');
  GM_addStyle('.target { font-style: italic; font-weight: 600; }');
  $('.jobs-filter-inner>div:last-child').append('<label for="jobs-filter" class="control-label">Sía</label><a href="#" id="jobs-filter-change"> (breyta)</a><input type="checkbox" name="jobs-filter-check" id="jobs-filter-check" class="checkbox"></div>');
  $('.jobs-filter-inner').append('<div id="jobs-filter-form"></div>');
  $('#jobs-filter-form').append('<div class="col-xxs-12 col-lg-12"><label for="jobs-filter-list" class="control-label">Sía út störf sem passa við orð í eftirfarandi lista</label></div>');
  $('#jobs-filter-form').append('<div class="col-xxs-12 col-sm-5"><textarea id="jobs-filter-list" class="form-control" rows="10"></textarea></div>');
  $('#jobs-filter-form').append('<div class="col-xxs-12 col-lg-12"><input type="button" id="jobs-filter-save" class="btn btn-default" value="Vista lista"><input type="button" id="jobs-filter-cancel" class="btn btn-default" value="Hætta við"></div>');
  $('#jobs-filter-check').change(function () {
   $('ul.list li').show();
   if (!$(this).is(':checked')) return;
   $('ul.list .name').each(function () {
    var name = $(this).text();
    var list = GM_getValue('filter-rvk', '').split('\n').filter(function (val, key) { return val; });
    if (!list.length) {
     $('ul.list li').show();
     return;
    }
    for (i = 0; i < list.length; i++) {
     var regex = new RegExp(list[i], 'i');
     if (regex.test(name)) {
      $(this).parents('li').hide();
      return true;
     }
    }
   });
  });
  $('#jobs-filter-change').click(function () {
   var list = GM_getValue('filter-rvk');
   $('#jobs-filter-list').val(list);
   $('#jobs-filter-form').show();
   return false;
  });
  $('#jobs-filter-save').click(function () {
   var list = $.trim($('#jobs-filter-list').val());
   GM_setValue('filter-rvk', list);
   $('#jobs-filter-form').hide();
   if ($('#jobs-filter-check').is(':checked')) {
    $('#jobs-filter-check').change();
   }
  });
  $('#jobs-filter-cancel').click(function () {
   $('#jobs-filter-form').hide();
  });
  $('.aside-container').append('<div id="jobs-status-info">Öll ný störf verða ská- og feitletruð við næstu heimsókn</div>');
  $('.aside-container').append('<input type="button" id="jobs-status-save" class="btn btn-default" value="Vista stöðu">');
  $('#jobs-status-save').click(function () {
   var list = [];
   $('ul.list li a').each(function () {
    var id = $(this).attr('href').match(/0+(\d+)$/).pop();
    list.push(id);
   });
   GM_setValue('targets-rvk', list.join('|'));
   $('.target').removeClass('.target');
  });
  var targets = GM_getValue('targets-rvk', '').split('|').filter(function (val, key) { return val; });
  if (list.length) {
   $('ul.list li a').each(function () {
    var id = $(this).attr('href').match(/0+(\d+)$/).pop();
    if ($.inArray(id, targets) == -1) {
     $(this).addClass('target');
    }
   });
  }
  break;
 case 'job.visir.is':
 case 'job.is':
  GM_addStyle('.target { border: 2px solid #009FE3; }');
  GM_addStyle('#save-position { position: relative; float: right; bottom: 4px; }');
  GM_addStyle('#job_cats .jobfilter { border-bottom: 2px solid transparent; }');
  $('#job_cats').append('<input type="button" id="save-position" value="Vista stöðu">');
  $('#save-position').click(function () {
   var target = $('.box.job:visible').first().find('.info a').attr('href').match(/\/(\d+)\//).pop();
   var jobs_type = $('.jobfilter.active').data('id');
   GM_setValue('target-job-' + jobs_type, target);
   show_target();
  });

  function show_target() {
   var jobs_type = $('.jobfilter.active').data('id');
   var target = GM_getValue('target-job-' + jobs_type);
   $('.target').removeClass('target');
   if (target) {
    $('.info a[href*="/' + target + '/"]').parents('.box.job').addClass('target');
   }
  }

  $('a.jobfilter').click(show_target);
  show_target();
  break;
 case 'starfatorg.is':
  GM_addStyle('.target { border-bottom: 2px solid #0d59dd; }');
  $('#pgnav .wrap').append('<div class="snav"><ul><li><a href="#" id="save-position">Vista stöðu</a></li></ul></div>');
  $('#save-position').click(function () {
   var target = $('.item').first().data('aid');
   GM_setValue('target-torg', target);
   $('.target').removeClass('target');
   $('.item').first().addClass('target');
   return false;
  });
  var target = GM_getValue('target-torg');
  if (target) {
   $('.item[data-aid="' + target + '"]').addClass('target');
  }
  break;
}