sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'com.ibspl.leaveapproval',
            componentId: 'TEAM_LEAVE_INFOList',
            contextPath: '/TEAM_LEAVE_INFO'
        },
        CustomPageDefinitions
    );
});