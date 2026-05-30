
let additionalHeaders = {};

window.loadRevealView = async function (viewId, dashboardName, headers) {
    let rvDashboard;


    if (dashboardName) {
        rvDashboard = await Reveal.RVDashboard.loadDashboard(dashboardName);
    }

    additionalHeaders = headers || {};

    Reveal.RevealSdkSettings.setAdditionalHeadersProvider(function (url) {
        return headers;
    });
    const revealView = createRevealView(viewId);
    if (!rvDashboard) {
        revealView.startInEditMode = true;

        revealView.onDataSourcesRequested = (callback) => {
            var sqlServerDataSource = new Reveal.RVAzureSqlDataSource();
            sqlServerDataSource.id="sqlServer";
            sqlServerDataSource.title = "SQL Server Data Source";
            sqlServerDataSource.subtitle = "Full Northwind Database";

            // SQL Server Data Source Item in Stored Procs
            var sqlDataSourceItem1 = new Reveal.RVAzureSqlDataSourceItem(sqlServerDataSource);
            sqlDataSourceItem1.id="CustomerOrders";
            sqlDataSourceItem1.title = "Customer Orders";
            sqlDataSourceItem1.subtitle = "Custom SQL Query (orderId)";

            var sqlDataSourceItem2 = new Reveal.RVAzureSqlDataSourceItem(sqlServerDataSource);
            sqlDataSourceItem2.id="CustOrderHist";
            sqlDataSourceItem2.title = "Customer Orders History";
            sqlDataSourceItem2.subtitle = "Stored Procedure (customerId)";

            var sqlDataSourceItem3 = new Reveal.RVAzureSqlDataSourceItem(sqlServerDataSource);
            sqlDataSourceItem3.id="CustOrdersOrders";
            sqlDataSourceItem3.title = "Customer Orders Orders";
            sqlDataSourceItem3.subtitle = "Stored Procedure  (customerId)";

            var sqlDataSourceItem4 = new Reveal.RVAzureSqlDataSourceItem(sqlServerDataSource);
            sqlDataSourceItem4.id="TenMostExpensiveProducts";
            sqlDataSourceItem4.title = "Ten Most Expensive Products";
            sqlDataSourceItem4.subtitle = "Stored Procedure";

            // ***** Excel Files *****
            var localFileItem = new Reveal.RVLocalFileDataSourceItem();
            localFileItem.id = "Northwind Traders Corp Sales"
            var excelDataSourceItem  = new Reveal.RVExcelDataSourceItem(localFileItem);
            excelDataSourceItem.id = "Northwind Traders Corp Sales";
            excelDataSourceItem.title = "Northwind Traders Corp Sales";

            var localFileItem1 = new Reveal.RVLocalFileDataSourceItem();
            localFileItem1.id = "IceCreamCoFinancials"
            var excelDataSourceItem1 = new Reveal.RVExcelDataSourceItem(localFileItem1);
            excelDataSourceItem1.id = "IceCreamCoFinancials";
            excelDataSourceItem1.title = "IceCreamCoFinancials";
            //**********************************************
            // Note, this is the callback that loads everything above into the dialog.  If you don't want to show the entire
            // database, just remove sqlServerDataSource from the array and leave it empty like this []
            callback(new Reveal.RevealDataSources([sqlServerDataSource],
                [sqlDataSourceItem1, sqlDataSourceItem2, sqlDataSourceItem3, sqlDataSourceItem4,
                    excelDataSourceItem, excelDataSourceItem1], false));

        };
    }
    revealView.dashboard = rvDashboard;
}


window.createRevealView = function (viewId) {
    Reveal.RevealSdkSettings.theme = createRevealTheme();
    if (!_revealViewInstances[viewId]) {
        _revealViewInstances[viewId] = new Reveal.RevealView("#" + viewId);
    }
    const revealView = _revealViewInstances[viewId];
    revealView.interactiveFilteringEnabled = true;

    revealView.onDashboardSelectorRequested = (args) => {
        openDialog(args.callback);
    };

    revealView.onLinkedDashboardProviderAsync = (dashboardId, title) => {
        return Reveal.RVDashboard.loadDashboard(dashboardId);
    };

    return revealView;
}


window.createRevealTheme = function () {
    var theme = Reveal.RevealSdkSettings.theme.clone();
    theme.chartColors = ["#09B1A9", "#003B4A", "#93C569", "#FEB51E", "#FF780D", "#CA365B"];
    theme.regularFont = "Poppins";
    theme.mediumFont = "Poppins";
    theme.boldFont = "Poppins";
    theme.useRoundedCorners = false;
    theme.accentColor = "#09B1A9";
    return theme;
}


window.createDashboardThumbnail = function (id, name) {
    Reveal.RVThumbnail.fromDashboard("#" + id, name);
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
    const dashboard = await Reveal.RVDashboard.loadDashboard(dashboardName);
    const json = dashboard._dashboardModel._dashboardModel.toJson();
    return JSON.stringify(json);
}


 Reveal.RevealSdkSettings.enableActionsOnHoverTooltip = true;


window.loadRevealViewSingleViz = function (viewId, dashboardName, vizId) {
    Reveal.RVDashboard.loadDashboard(dashboardName).then(dashboard => {
        var revealView = new Reveal.RevealView("#" + viewId);
        revealView.interactiveFilteringEnabled = true;
        revealView.singleVisualizationMode = true;
        //revealView.showHeader = false;
        //revealView.showMenu = false;
        revealView.dashboard = dashboard;
        revealView.maximizedVisualization = dashboard.visualizations.getById(vizId);
    });
}



window.registerAddDashboardInstance = function (dotnetRef) {
    window.revealAddView = new Reveal.RevealView(document.getElementById("revealView"));
    revealAddView.hoverTooltipsEnabled = true;
    revealAddView.interactiveFilteringEnabled = true;
    revealAddView.startInEditMode = true;

    revealAddView.onSave = async function () {
        await dotnetRef.invokeMethodAsync("SaveDashboard");
    };
};


let _revealViewInstances = {};

window.setDashboardFilter = async function (viewId, filterTitle, filterValue) {
    const revealView = _revealViewInstances[viewId];
    if (!revealView || !revealView.dashboard) {
        console.warn("RevealView not ready for viewId:", viewId);
        return;
    }
    const filter = revealView.dashboard.filters.getByTitle(filterTitle);
    if (filter) {
        filter.selectedValues = [filterValue];
    } else {
        console.warn("Filter not found:", filterTitle);
    }
}

window.loadRevealViewWithDom = async function (viewId, json) {
    const rdashDoc = dom.RdashDocument.loadFromJson(json);
    const dashboard = await rdashDoc.toRVDashboard();
    if (!_revealViewInstances[viewId]) {
        _revealViewInstances[viewId] = new Reveal.RevealView("#" + viewId);
    }
    const revealView = _revealViewInstances[viewId];
    revealView.interactiveFilteringEnabled = true;
    revealView.startInEditMode = true;
    revealView.dashboard = dashboard;
    revealView.onSave = (sender, e) => {
        window.builderInstance.invokeMethodAsync('UpdateDashboardTitle', e.name);
        e.saveFinished();
    }
}