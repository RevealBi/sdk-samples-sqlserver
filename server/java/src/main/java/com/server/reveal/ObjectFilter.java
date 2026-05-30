package com.server.reveal;

import io.revealbi.core.IRVUserContext;
import io.revealbi.core.data.IRVObjectFilter;
import io.revealbi.core.data.RVDataSourceItem;
import io.revealbi.core.data.RVSqlServerDataSourceItem;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class ObjectFilter implements IRVObjectFilter {

    @Override
    public boolean filter(IRVUserContext userContext, RVDataSourceItem dataSourceItem) {
        if (userContext != null && userContext.getProperties() != null &&
            dataSourceItem instanceof RVSqlServerDataSourceItem) {

            RVSqlServerDataSourceItem dataSQLItem = (RVSqlServerDataSourceItem) dataSourceItem;

            Object filterTablesObj = userContext.getProperties().get("FilterTables");
            if (filterTablesObj instanceof String[]) {
                String[] filterTables = (String[]) filterTablesObj;

                // If filterTables is empty, allow all
                if (filterTables.length == 0) {
                    return true;
                }

                // Otherwise, restrict to allowed tables/procedures
                if ((dataSQLItem.getTable() != null && !Arrays.asList(filterTables).contains(dataSQLItem.getTable())) ||
                    (dataSQLItem.getProcedure() != null && !Arrays.asList(filterTables).contains(dataSQLItem.getProcedure()))) {
                    return false;
                }
            }
        }
        return true;
    }

}
