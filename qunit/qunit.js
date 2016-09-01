var _modal_opts = {
  header: 'Tabbed Modal',
  tabs: {
    first: {
      label: 'Default Tab',
      active: true,
      showTab: function() {
        $('#demo').tabModal('setTabContent', 'first', '<h3>Default</h3>');
      }
    }, second: {
      label: 'Second Tab',
      showTab: function() {
        // this tab does nothing
      }
    }, third: {
      label: 'Third Tab',
      showTab: function() {
        $('#demo').tabModal('setTabContent', 'third', '<h3>Third!</h3>');
      }
    }, fourth: {
      label: 'Fourth Tab',
      showTab: function() {
        $('#demo').tabModal('setTabContent', 'fourth', '<h3>Fourth!</h3>');
      }
    }, noShowTabFn: {
      label: 'No Show Tab'
    }
  }
};

function tabIsActive( $anchor, tab_id ) {
  return tabLink( $anchor, tab_id ).parent().hasClass('active');
}

function tabLink( $anchor, tab_id ) {
  return $(".tab-modal[data-tab-modal-id='"+$anchor.prop('id')+"']").find("a[data-target='#"+tab_id+"']");
}

QUnit.test( "one active tab", function( assert ) {
  expect(2);
  var $anchor = $("<div id='test1'></div>");
  $anchor.appendTo('body');
  $anchor.tabModal(_modal_opts).on( 'sh.tabModal.shown', function() {
    assert.ok( tabIsActive($anchor, 'first'), 'first tab is active' );
    assert.ok( !tabIsActive($anchor, 'second'), 'second tab is not active' );
    $anchor.tabModal('close');
  });
  $anchor.tabModal('show');
});

QUnit.test( "click second tab", function( assert ) {
  expect(2);
  var $anchor = $("<div id='test2'></div>");
  $anchor.appendTo('body');
  $anchor.tabModal(_modal_opts).on( 'sh.tabModal.shown', function() {
    tabLink($anchor, 'second').trigger('click');
    assert.ok( !tabIsActive($anchor, 'first'), 'first tab is active' );
    assert.ok( tabIsActive($anchor, 'second'), 'second tab is not active' );
    $anchor.tabModal('close');
  });
  $anchor.tabModal('show');
});

QUnit.test( "click third tab", function( assert ) {
  expect(1);
  var done = assert.async();
  var $anchor = $("<div id='test3'></div>");
  $anchor.appendTo('body');
  $anchor.tabModal(_modal_opts).on( 'sh.tabModal.shown', function() {
    $anchor.tabModal('setTabContent', 'third', "<p class='third-test-content'>some stuff</p>");
    $anchor.tabModal('clickTab', 'third');
    assert.ok( tabIsActive($anchor, 'third'), 'second tab is not active' );
    $anchor.tabModal('close');
    done();
  });
  $anchor.tabModal('show');
});

QUnit.test( "add tabs", function( assert ) {
  expect(1);
  var done = assert.async();
  var $anchor = $("<div id='test4'></div>");
  $anchor.appendTo('body');
  $anchor.tabModal(_modal_opts).on( 'sh.tabModal.shown', function() {
    $anchor.tabModal('addTabs', {
      fifth: {
        label: 'Added Dynamically',
        content: "blah blah"
      }
    });
    $anchor.tabModal('clickTab', 'fifth');
    assert.ok( tabIsActive($anchor, 'fifth'), 'fifth tab is active' );
    $anchor.tabModal('close');
    done();
  });
  $anchor.tabModal('show');
});

QUnit.test("reload tab", function(assert) {
  expect(1);
  var done = assert.async();
  var $anchor = $("<div id='test5'></div>");
  $anchor.appendTo('body');
  $anchor.tabModal(_modal_opts).on( 'sh.tabModal.shown', function() {
    tabLink($anchor, 'fourth').trigger('click');
    $anchor.tabModal('markForReload', 'fourth');
    assert.ok($('#fourth').hasClass('load-content'));
    $anchor.tabModal('close');
    done();
  });
  $anchor.tabModal('show');
});

QUnit.test("no showTab function", function(assert) {
  expect(1);
  var done = assert.async();
  var $anchor = $("<div id='test6'></div>");
  $anchor.appendTo('body');
  $anchor.tabModal(_modal_opts).on( 'sh.tabModal.shown', function() {
    $anchor.tabModal('setTabContent', 'noShowTabFn', "<p class='fifth-test-content'>some stuff</p>");
    $anchor.tabModal('clickTab', 'noShowTabFn');
    assert.ok(tabIsActive($anchor, 'noShowTabFn'));
    $anchor.tabModal('close');
    done();
  });
  $anchor.tabModal('show');
});
