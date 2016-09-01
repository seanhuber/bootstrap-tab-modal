/*
  jQuery widget for a tabbed Bootstrap modal (https://github.com/seanhuber/bootstrap-tab-modal)
  Version 1.1.0
*/
(function($) {
  $.widget( 'sh.tabModal' , {
    options: {
      dismissable: true,
      default_tab_content: 'use-throbber',
      header: '<h3>header html</h3>', // string or function ( 'this' is set to the widget's anchor element )
      tabs: {}
    },

    _create: function() {
      this.element.uniqueId();
      this._data = {
        el_id: this.element.prop('id')
      };
    },

    addTabs: function( new_tabs ) {
      var that = this;
      $.each( new_tabs, function(tab_id, v) {
        if ( that.options.tabs.hasOwnProperty(tab_id) ) {
          delete new_tabs[ tab_id ];
        }
      });

      if ( Object.keys(new_tabs).length > 0 ) {
        var $modal = this._getModal();
        var tab_html = this._buildTabHtml( new_tabs );
        $( tab_html.t_links ).appendTo( $modal.find('ul.nav-tabs') );
        $( tab_html.t_panels ).appendTo( $modal.find('.tab-content') );
        $.extend( this.options.tabs, new_tabs );
      }
    },

    ajaxErrorHandler: function( jqXHR, textStatus, errorThrown ) {
      if( jqXHR.hasOwnProperty('responseJSON') && jqXHR.responseJSON.hasOwnProperty('error') ) {
        var alert_html = "<div class='error-message'>" + jqXHR.responseJSON.error + "</div><a href='#' class='error-details'>Error details for administrators</a>";
        this.showAlert({ html_msg: alert_html });
        var $modal = this._getModal();
        $modal.find('.alert .error-details').popover({
          placement: 'bottom',
          html: true,
          content: '<pre>'+jqXHR.responseJSON.trace+'</pre>'
        });
        $modal.find('.alert .error-details').click( function() {
          return false;
        });
      } else {
        console.log('ERROR:', jqXHR );

        var alert_html = "<div class='error-message'>" + errorThrown + "</div><a href='#' class='error-details'>Error details for administrators</a>";
        this.showAlert({ html_msg: alert_html });
        var $modal = this._getModal();
        $modal.find('.alert .error-details').popover({
          placement: 'bottom',
          html: true,
          content: '<pre>'+jqXHR.responseText+'</pre>'
        });
        $modal.find('.alert .error-details').click( function() {
          return false;
        });
      }
    },

    clickTab: function( tab_id ) {
      $( "a[data-target='#"+tab_id+"']" ).tab('show');
    },

    close: function() {
      this._getModal().modal('hide');
    },

    hideAlert: function( opts ) {
      this._getModal().find('.alert').hide();
    },

    hideTab: function( tab_id ) {
      $( "a[data-target='#"+tab_id+"']" ).addClass('hidden');
    },

    markForReload: function(tab_id) {
      $('#' + tab_id).addClass('load-content');
    },

    setDefaultTab: function( tab_id ) {
      $.each( this.options.tabs, function(k, v) { delete v.active; });
      this.options.tabs[tab_id].active = true;
    },

    setOption: function( key, value ) {
      this.options[key] = value;
    },

    setTabContent: function( tab_id, tab_html ) {
      var $tabpanel = this._getModal().find('#' + tab_id);
      $tabpanel.html( tab_html );
      $tabpanel.removeClass('throbbing');
      $tabpanel.removeClass('load-content');
    },

    show: function() {
      var that = this;

      if ( this._getModal().length > 0 ) return false; // already visible

      var $modal = this._buildModal();

      $initial_tabpanel = $modal.find('.tab-pane.active');
      if ($initial_tabpanel.hasClass('load-content')) {
        this._addThrobber( $initial_tabpanel );
        var tab = this.options.tabs[$initial_tabpanel.prop('id')];
        if (tab.showTab) {
          tab.showTab();
        }
        $initial_tabpanel.removeClass('load-content');
      }

      $modal.find("a[data-toggle='tab']").on('show.bs.tab', function (e) {
        that.hideAlert();
        var $tabpanel = $($(e.target).data('target'));
        if ($tabpanel.hasClass('load-content')) {
          that._addThrobber( $tabpanel );
          var tab = that.options.tabs[$tabpanel.prop('id')]
          if (tab.showTab) {
            tab.showTab();
          }
          $tabpanel.removeClass('load-content');
        }
      });

      var modal_opts = { show: true };
      if ( !this.options.dismissable ) {
        $.extend( modal_opts, {backdrop: 'static', keyboard: false} );
      }

      // destroy the widget once the modal is hidden
      $modal.on( 'hidden.bs.modal', function() { this.remove(); });

      // show the modal
      $modal.modal( modal_opts );
      this._data.shown = true;
      this.element.trigger('sh.tabModal.shown');
    },

    showAlert: function( opts ) {
      var $alert = this._getModal().find('.alert');
      $alert.find('.alert-content').html( opts.html_msg );

      var alert_class = opts.hasOwnProperty( 'type' ) ? opts.type : 'error';
      if (alert_class == 'error') alert_class = 'danger';
      $alert.removeClass('alert-danger alert-info alert-warning alert-danger').addClass('alert-'+alert_class);

      $alert.slideDown( 'fast' );
    },

    showAllTabs: function() {
      $.each( this.options.tabs, function(k, v) { delete v.hidden; });
    },

    showSingleTab: function( tab_id ) {
      this.setDefaultTab( tab_id );
      $.each( this.options.tabs, function(k, v) {
        if ( k != tab_id ) {
          v.hidden = true;
        }
      });
    },

    _addThrobber: function( $tabpanel ) {
      $tabpanel.addClass('throbbing')
      $tabpanel.html('Loading...');
      var throb = Throbber({color: 'black'});

      // $tabpanel[0] because throbber.js needs to attach to nativ DOM element
      // https://learn.jquery.com/using-jquery-core/faq/how-do-i-pull-a-native-dom-element-from-a-jquery-object/
      throb.appendTo( $tabpanel[0] );

      throb.start();
    },

    _buildModal: function() {
      var that = this;
      var $modal = $( "<div class='modal fade tab-modal' data-tab-modal-id='"+this._data.el_id+"'><div class='modal-dialog modal-lg'><div class='modal-content'><div class='modal-body'></div></div></div></div>" ).appendTo('body');

      var header_text = typeof this.options.header === 'function' ? this.options.header.apply(this.element) : this.options.header;
      $("<div class='tab-modal-header'>"+header_text+"</div>").appendTo( $modal.find('.modal-body') );
      if ( this.options.dismissable ) {
        $("<button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>").prependTo( $modal.find('.tab-modal-header') );
      }

      var tablinks_html = "<ul class='nav nav-tabs' role='tablist'>";
      var tabpanel_html = "<div class='alert alert-danger' role='alert'><div class='alert-content'>&nbsp;</div></div><div class='tab-content'>";

      var tab_html = this._buildTabHtml( this.options.tabs );
      tablinks_html += tab_html.t_links;
      tabpanel_html += tab_html.t_panels;

      tablinks_html += "</ul>";
      tabpanel_html += "</div>";

      $(tablinks_html+tabpanel_html).appendTo( $modal.find('.modal-body') );
      return $modal;
    },

    _buildTabHtml: function( tabs ) {
      var t_html = { t_links: '', t_panels: '' };
      var that = this;
      $.each( tabs, function(k, v) {
        var tab_class = v.hasOwnProperty( 'active' ) ? 'active' : '';
        tab_class += v.hasOwnProperty( 'hidden' ) ? ' hidden' : '';

        t_html.t_links += "<li role='presentation' class='"+tab_class+"'><a data-target='#"+k+"' aria-controls='"+k+"' role='tab' data-toggle='tab'>"+v.label+"</a></li>";
        var tab_content = v.hasOwnProperty( 'content' ) ? v.content : that.options.default_tab_content;
        t_html.t_panels += "<div role='tabpanel' class='load-content tab-pane "+tab_class+"' id='"+k+"'>"+tab_content+"</div>";
      });
      return t_html;
    },

    _getModal: function() {
      return $("body > .modal[data-tab-modal-id='"+this._data.el_id+"']");
    }
  });
})(jQuery);
