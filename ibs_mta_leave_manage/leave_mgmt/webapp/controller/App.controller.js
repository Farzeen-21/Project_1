sap.ui.define([
  "sap/ui/core/mvc/Controller"
], (BaseController) => {
  "use strict";
  var that;
  var appModulePath;

  return BaseController.extend("com.ibspl.leavemgmt.controller.App", {
    onInit() {
      that = this;
      var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
      var appPath = appId.replaceAll(".", "/");
      appModulePath = jQuery.sap.getModulePath(appPath);

      var oRouter = this.getOwnerComponent().getRouter().getRoute("RouteApp");
      oRouter.attachPatternMatched(this.handleRouteMatched, this);
    },

    getRouter: function () {
      return sap.ui.core.UIComponent.getRouterFor(this);
    },

    handleRouteMatched: function (oEvent) {

      var path = appModulePath + "/odata/v4/team-leave-planner/MasterLeaveType";
      $.ajax({
        url: path,
        type: 'GET',
        contentType: 'application/json',
        success: function (data, response) {
          that.getRouter().navTo("RouteMaster");
        },
        error: function (oError) {
          that.getRouter().navTo("ServiceMsg");
        }
      });
    }
  });
});