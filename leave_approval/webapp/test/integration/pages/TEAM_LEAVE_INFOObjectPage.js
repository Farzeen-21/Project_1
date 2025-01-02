sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'com.ibspl.leaveapproval',
            componentId: 'TEAM_LEAVE_INFOObjectPage',
            contextPath: '/TEAM_LEAVE_INFO'
        },
        CustomPageDefinitions
    );
});