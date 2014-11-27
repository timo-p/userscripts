// ==UserScript==
// @name         Resque multiselect
// @namespace    resque
// @homepage     https://github.com/timo-p/userscripts/resque-multiselect
// @version      0.1
// @description  Select multiple failed jobs at once in resque web
// @author       timo-p
// @match        */resque/failed*
// @grant        none
// ==/UserScript==

var $selectAll = $('<input type="submit" onclick="return false;" value="Select all"></input>');
var $retrySelected = $('<input type="submit" onclick="return false;" value="Retry selected"></input>');
var $removeSelected = $('<input type="submit" onclick="return false;" value="Remove selected"></input>');

var processSelected = function(type){
    var $elems = $('input.multiselect:checked');
    if (type == 'retry')
    {
        $elems = $elems.filter(function(){
            var $elem = $(this);
            return $elem.data('retry') ? true : false;
        });
    }

    if ($elems.length > 0)
    {
        $retrySelected.attr('disabled', true);
        $removeSelected.attr('disabled', true);

        $elems.sort(function(a, b){
            var $a = $(a);
            var $b = $(b);
            if ($a.data('id') == $b.data('id'))
                return 0;

            return $a.data('id') < $b.data('id') ? 1 : -1;
        });

        var urls = [];
        $elems.each(function(i, elem){
            $elem = $(elem);
            urls.push($elem.data(type));
        });

        var doRequest = function(url){
            $.get(url, function(){
                if (urls.length > 0)
                    doRequest(urls.shift());
                else
                    window.location.reload();
            });
        };
        doRequest(urls.shift());
    }
};

$selectAll.click(function(){
    var $elem = $(this);
    var checked = $elem.data('select-all') ? ':checked' : ':not(:checked)';
    $elem.data('select-all', $elem.data('select-all') ? false : true);
    $('input.multiselect'+checked).click();
});
$removeSelected.click(function(event){
    processSelected('remove');
});
$retrySelected.click(function(event){
    processSelected('retry');
});

var $form = $('<form></form>');
$form.append($selectAll).append($retrySelected).append($removeSelected);
$('#main > h1').after($form);

$('div.controls,div.retried').each(function(){
    var $e = $(this);
    var $checkbox = $('<input type="checkbox" class="multiselect" style="float: right;margin-left:10px;"></input>');
    var $retry = $e.find('a[rel=retry]');
    var $remove = $e.find('a[rel=remove]');
    var domain = window.location.protocol+'//'+window.location.host;
    var id = parseInt($remove.attr('href').match(/\d+$/)[0], 10);
    $checkbox.data('remove', domain+$remove.attr('href')).data('id', id);
    if ($retry.length > 0)
        $checkbox.data('retry', domain+$retry.attr('href'));

    $e.before($checkbox);
});
