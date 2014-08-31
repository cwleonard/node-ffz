
    dojo.require("dijit.MenuBar");
    dojo.require("dijit.MenuBarItem");
    dojo.require("dijit.PopupMenuBarItem");
    dojo.require("dijit.Menu");
    dojo.require("dijit.MenuItem");
    dojo.require("dijit.PopupMenuItem");


        function createMenuBar(nid) {
        
            pMenuBar = new dijit.MenuBar({});

            var fileMenu = new dijit.Menu({});
            fileMenu.addChild(new dijit.MenuItem( {label: "Load", onClick: function() { dijit.byId('loadAreaDialog').show(); } } ) );
            fileMenu.addChild(new dijit.MenuItem( {label: "Save", onClick: function() { dijit.byId('saveAreaDialog').show(); } } ) );
            fileMenu.addChild(new dijit.MenuItem( {label: "Play", onClick: function() { playThis(); } } ) );
            fileMenu.addChild(new dijit.MenuItem( {label: "Exit"} ) );

            pMenuBar.addChild(new dijit.PopupMenuBarItem( {label: "File", popup: fileMenu } ) );

            var editMenu = new dijit.Menu({});
            editMenu.addChild(new dijit.MenuItem( {label: "Add Rows", onClick: function() {
                dojo.byId('addRowsButton').style.display = "block";
                dojo.byId('addColsButton').style.display = "none";
                dijit.byId('rowColumnDialog').show();
            } } ) );
            editMenu.addChild(new dijit.MenuItem( {label: "Add Columns", onClick: function() {
                dojo.byId('addRowsButton').style.display = "none";
                dojo.byId('addColsButton').style.display = "block";
                dijit.byId('rowColumnDialog').show();
            } } ) );

            editMenu.addChild(new dijit.MenuItem( {label: "Edit Links", onClick: function() {
            	displayLinks();
                dijit.byId('linksDialog').show();
            } } ) );

            pMenuBar.addChild(new dijit.PopupMenuBarItem( {label: "Edit", popup: editMenu } ) );
            
            pMenuBar.placeAt(nid);
            pMenuBar.startup();
            
        }
    
    /**
     * Creates the popup menus for the grid area.
     */
    function createPopupMenus() {
        
	    objPopMenu = new dijit.Menu();
        objPopMenu.addChild(new dijit.MenuItem( {label: "Delete Object", onClick: deleteObject } ) );
        objPopMenu.startup();

	    gridPopMenu = new dijit.Menu();
        gridPopMenu.addChild(new dijit.MenuItem( {label: "Add Rows Here", onClick: addRowsMenuClick } ) );
        gridPopMenu.addChild(new dijit.MenuItem( {label: "Add Columns Here", onClick: addColumnsMenuClick } ) );
        gridPopMenu.startup();
            
    }
