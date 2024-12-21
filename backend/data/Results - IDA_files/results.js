var rerun_audit = function rerun_audit(url) {
    document.rerun.action = url;
    document.rerun.submit();
}

/* function for showing student view (used for printing purposes) */
var student_view = function student_view() {
  	if($("#show_student_view").text() == "Show Student View"){     
      	$(".admin_print_only").hide();
  		$("#show_student_view").text("Show Admin View");
  	} else {     
      	$(".admin_print_only").show();
  		$("#show_student_view").text("Show Student View");
  	};
}

$(document).ready( function(){

    // handle popup modals
    $('.modal_link').bind('click', function(e){
        
        e.preventDefault();
        var url = this.href;

        $('.modal_container').bPopup({
            contentContainer: '.modal_content',
            loadUrl: url
        });

    });

    //This displays helpful information regarding 'action needed' in results legend when you hover over the "i"/info icon
    $('.info_icon_cc').hover(function(){
        // Important! If this text is changed, it must be changed in results_display.html as well.
        $(this).attr('title', 'The requirement has been auto-completed based on your transcript from \n' +
                              'another institution. Auto-completion applies to all undergraduate degree \n' +
                              'holders and students marked as core complete by a \n' +
                              'Texas public university.\n');
    });

    $('tr.details').hide();
    $('.view').find('a.section_details').parents('table.results thead').addClass('open');
    
    $('#show_hide_all_cat a.show_all').click( function(e) {
        e.preventDefault();
        $('#categories.view').find('tbody.section').slideDown();
        $('#categories.view').find('a.section_details').parents('table.results thead').addClass('open');
        $('#categories.view').find('tr.details').slideDown();
        $('#categories.view').find('a.details').parents('tr').addClass('open');
    });
    
    $('#show_hide_all_cat a.hide_all').click( function(e) {
        e.preventDefault();
        $('#categories.view').find('tr.details').slideUp();
        $('#categories.view').find('a.details').parents('tr').removeClass('open');
    });
    
    $('#show_hide_all_rr a.show_all').click( function(e) {
        e.preventDefault();
        $('#remaining_reqs.view').find('tbody.section').slideDown();
        $('#remaining_reqs.view').find('a.section_details').parents('table.results thead').addClass('open');
        $('#remaining_reqs.view').find('tr.details').slideDown();
        $('#remaining_reqs.view').find('a.details').parents('tr').addClass('open');
    });
    
    $('#show_hide_all_rr a.hide_all').click( function(e) {
        e.preventDefault();
        $('#remaining_reqs.view').find('tr.details').slideUp();
        $('#remaining_reqs.view').find('a.details').parents('tr').removeClass('open');
    });
    
    $('table.results thead a.section_details').click( function(e) {
        e.preventDefault(); 
        $(this).parents('table.results thead').toggleClass('open').next('tbody.section').toggle();
    }); 

    
    $('a.details').click( function(e) {
        e.preventDefault(); 
        $(this).parents('tr').toggleClass('open').next('.details').toggle();
    });   

    $('#coursework').hide();
    $('#remaining_reqs').hide();        

    $('.tabs a').click( function(e) {
        e.preventDefault();
        var $tab = $(this);
        $('.tabs a').each(function(){
        	$(this).removeClass('active');
        })
        if ( ! $tab.hasClass('active')) {
            $('.view').slideUp();
            var target = $tab.attr('href');
            $(target).slideDown();
            $($tab).addClass('active');
        }
    });

    $('a[title~="results"]').click(function() { /* attach event to the link in the results of the search results
                            this will match any anchor with 'results' somewhere in the title */
            $wait_message = $('<h2></h2>').text('This may take awhile. So sit back and relax!');
            $('body').html($wait_message);
    });
    
    // enable link to show student view    
    $('#show_student_view').click( function(e) {
        e.preventDefault();
        student_view();
    });        

    // display infobar
    
    try {
        $.infobar(ib_settings);
    
    // new function to change environment
        $('#infobar li').eq(2)
        .addClass('env_switch')
        .click(function(e){
            e.preventDefault();
            $.ajax({
              url: '/apps/degree/audits/auths/env_switch',
              context: this,
              success: function() {
              window.location.reload();
              }
        });
      });
    }
    catch(err) {
        console.log(err);
    };

    $('.an-modal-link, .info_icon_cc, .action-need-img').click(function(){
        var modal = document.getElementById('action_needed_modal');
        modal.style.display = 'block';
    });
    $('.close-x').click(function(){
        var modal = document.getElementById('action_needed_modal');
        modal.style.display = 'none';
    });
 	$(document).click(function(e) {
 	    if ($(e.target).is('.an-modal')){
 	        var modal = document.getElementById('action_needed_modal');
 	        modal.style.display = 'none';
 	    }
    });
    $(document).keyup(function(e) {
        if (e.keyCode == 27 || e.keyCode == 8 || e.keyCode == 13 || e.keyCode == 32) {
            var modal = document.getElementById('action_needed_modal');
            modal.style.display = 'none';
        }
    });

    djdt.init();
});
