let additionalHeaders = {};

window.loadRevealView = async function (viewId, dashboardName, headers) {
    let rvDashboard;

    if (dashboardName) {
        rvDashboard = await $.ig.RVDashboard.loadDashboard(dashboardName);
    }

    additionalHeaders = headers || {};

    $.ig.RevealSdkSettings.setAdditionalHeadersProvider(function (url) {
        return headers;
    });
    const revealView = createRevealView(viewId);
    if (!rvDashboard) {
        revealView.startInEditMode = true;

        revealView.onDataSourcesRequested = (callback) => {
            var sqlServerDataSource = new $.ig.RVAzureSqlDataSource();
            sqlServerDataSource.id="sqlServer";
            sqlServerDataSource.title = "SQL Server Data Source";
            sqlServerDataSource.subtitle = "Full Northwind Database";
    
            // SQL Server Data Source Item in Stored Procs
            var sqlDataSourceItem1 = new $.ig.RVAzureSqlDataSourceItem(sqlServerDataSource);
            sqlDataSourceItem1.id="CustomerOrders";
            sqlDataSourceItem1.title = "Customer Orders";
            sqlDataSourceItem1.subtitle = "Custom SQL Query (orderId)";
    
            var sqlDataSourceItem2 = new $.ig.RVAzureSqlDataSourceItem(sqlServerDataSource);
            sqlDataSourceItem2.id="CustOrderHist";
            sqlDataSourceItem2.title = "Customer Orders History";
            sqlDataSourceItem2.subtitle = "Stored Procedure (customerId)";
    
            var sqlDataSourceItem3 = new $.ig.RVAzureSqlDataSourceItem(sqlServerDataSource);
            sqlDataSourceItem3.id="CustOrdersOrders";
            sqlDataSourceItem3.title = "Customer Orders Orders";
            sqlDataSourceItem3.subtitle = "Stored Procedure  (customerId)";
    
            var sqlDataSourceItem4 = new $.ig.RVAzureSqlDataSourceItem(sqlServerDataSource);
            sqlDataSourceItem4.id="TenMostExpensiveProducts";
            sqlDataSourceItem4.title = "Ten Most Expensive Products";
            sqlDataSourceItem4.subtitle = "Stored Procedure";

            // ***** Excel Files *****
             var localFileItem = new $.ig.RVLocalFileDataSourceItem();
            localFileItem.id = "Northwind Traders Corp Sales"
            var excelDataSourceItem  = new $.ig.RVExcelDataSourceItem(localFileItem);
            excelDataSourceItem.id = "Northwind Traders Corp Sales";
            excelDataSourceItem.title = "Northwind Traders Corp Sales";

            var localFileItem1 = new $.ig.RVLocalFileDataSourceItem();
            localFileItem1.id = "IceCreamCoFinancials"
            var excelDataSourceItem1 = new $.ig.RVExcelDataSourceItem(localFileItem1);
            excelDataSourceItem1.id = "IceCreamCoFinancials";
            excelDataSourceItem1.title = "IceCreamCoFinancials";
            //**********************************************
            // Note, this is the callback that loads everything above into the dialog.  If you don't want to show the entire
            // database, just remove sqlServerDataSource from the array and leave it empty like this []
            callback(new $.ig.RevealDataSources([sqlServerDataSource],
                [sqlDataSourceItem1, sqlDataSourceItem2, sqlDataSourceItem3, sqlDataSourceItem4,
                    excelDataSourceItem, excelDataSourceItem1], false));
    
            };
    }
    revealView.dashboard = rvDashboard;
}

window.createRevealView = function (viewId) {
    $.ig.RevealSdkSettings.theme = createRevealTheme(viewId);
    const revealView = new $.ig.RevealView("#" + viewId);
    revealView.interactiveFilteringEnabled = true;

    revealView.onDashboardSelectorRequested = (args) => {
        openDialog(args.callback);
    };

    revealView.onLinkedDashboardProviderAsync = (dashboardId, title) => {
        return $.ig.RVDashboard.loadDashboard(dashboardId);
    };

    return revealView;
  }

window.createRevealTheme = function () {
    var theme = $.ig.RevealSdkSettings.theme.clone();
    theme.chartColors = ["#09B1A9", "#003B4A", "#93C569", "#FEB51E", "#FF780D", "#CA365B"];
    theme.regularFont = "Poppins";
    theme.mediumFont = "Poppins";
    theme.boldFont = "Poppins";
    theme.useRoundedCorners = false;
    theme.accentColor = "#09B1A9";
    return theme;
}

window.createDashboardThumbnail = function (id, info) {
    console.log("info " + info);
    $.ig.RevealSdkSettings.theme = createRevealTheme(id, "");
    let thumbnailView = new $.ig.RevealDashboardThumbnailView("#" + id);
    thumbnailView.dashboardInfo = info;
}

function downloadFile(url, filename) {
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

window.getRVDashboardAsJson = async function (dashboardName) {
    const dashboard = await $.ig.RVDashboard.loadDashboard(dashboardName);
    const json = dashboard._dashboardModel.__dashboardModel.toJson();
    return JSON.stringify(json);
}

 $.ig.RevealSdkSettings.enableActionsOnHoverTooltip = true;

window.loadRevealViewSingleViz = function (viewId, dashboardName, vizId) {
    $.ig.RVDashboard.loadDashboard(dashboardName).then(dashboard => {
        var revealView = new $.ig.RevealView("#" + viewId);
        revealView.interactiveFilteringEnabled = true;
        revealView.singleVisualizationMode = true;
        //revealView.showHeader = false;
        //revealView.showMenu = false;
        revealView.dashboard = dashboard;
        revealView.maximizedVisualization = dashboard.visualizations.getById(vizId);
    });
}


window.registerAddDashboardInstance = function (dotnetRef) {
    window.revealAddView = new $.ig.RevealView(document.getElementById("revealView"));
    revealAddView.hoverTooltipsEnabled = true;
    revealAddView.interactiveFilteringEnabled = true;
    revealAddView.startInEditMode = true;

    revealAddView.onSave = async function () {
        await dotnetRef.invokeMethodAsync("SaveDashboard");
    };
};

window.setDashboardFilter = async function (viewId, filterTitle, filterValue) {
    let rvDashboard = await $.ig.RVDashboard.loadDashboard("Employee Sales Analysis");
    const revealView = new $.ig.RevealView("#" + viewId);
    revealView.dashboard = rvDashboard;

    const territoryFilter = revealView.dashboard.filters.getByTitle(filterTitle);
    if (territoryFilter) {
        territoryFilter.selectedValues = [filterValue];
    } else {
        console.warn("Filter not found:", filterTitle);
    }
}

window.loadRevealViewWithDom = async function (viewId, json) {
    const document = dom.RdashDocument.loadFromJson(json);
    const dashboard = await document.toRVDashboard();
    var revealView = new $.ig.RevealView("#" + viewId);
    revealView.interactiveFilteringEnabled = true;
    revealView.startInEditMode = true;
    revealView.dashboard = dashboard;
    revealView.onSave = (sender, e) => {
        window.builderInstance.invokeMethodAsync('UpdateDashboardTitle', e.name);
        e.saveFinished();
    }
}