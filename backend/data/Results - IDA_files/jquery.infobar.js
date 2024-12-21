/*
 *  Project: $.infobar
 *  Description: Create a fixed-position information bar (infobar!) element at the top of 
 *  the page for the purpose of desplaying messages or other information that 
 *  should be highly visible to the visitor.
 *
 *  Author: Michael Caldwell
 *  License: MIT
 */

// the semi-colon before function invocation is a safety net against concatenated 
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {
    // Create the defaults once
    var pluginName = 'infobar',
        defaults = {
            skinPrefix: "ib_",
						items: null,
						skin:	null,
						hide: null
        };

    // The actual plugin constructor
    function Plugin( options ) {
			
        this.options = $.extend( {}, defaults, options) ;
				
        this._defaults = defaults;
        this._name = pluginName;
				
        this.init();
    }

    Plugin.prototype.init = function () {		
			if ( this.options.items ) {
				/* get rid of any existing infobars */
				$('#infobar').remove();

        // console.log('infobar!');
				
				/* create the infobar */
				var $infobar = $('<div></div>').attr('id','infobar').addClass('infobar');
				
				/* set skin if specified */
				if (this.options.skin) {
					var skinClass = this.options.skinPrefix + this.options.skin;
					$infobar.addClass(skinClass);
				}
				
				/* build the itemlist */
				var $list = $('<ul></ul>');
				$.each (this.options.items, function(key, value) {
						var $li = $('<li></li>');
						if (key) $('<span class="infobar_label"></span>').text(key).appendTo($li);			
						if (value) $('<span class="infobar_value"></span>').text(value).appendTo($li);
						$li.appendTo($list);
				});
				$list.appendTo($infobar);
				
				/* add the infobar to the page, just after the body tag */
				// $('body').wrapInner('<div id="infobar_wrapper"></div>');
        // removed infobar_wrapper, because it does not play well with djDebugBar - mtc
				$('body').prepend($infobar);
			} 
			if (this.options.hide) $(this.options.hide).addClass('visuallyhidden');			
    };

		// Implement plugin as a standalone function in the $ namespace because it is invoked
		// without a selector. Check to ensure function not defined elsewhere.
		if ($[pluginName] === undefined) {
			$[pluginName] = function ( options ) { 
				new Plugin( options )
			};
		} else {
			alert('Collision: '+pluginName+' function has already been defined.');
		}

})($, window, document);
