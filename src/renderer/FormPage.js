import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FormRowRenderer } from './FormRow';
export const FormPageRenderer = ({ page, schema, visibleFieldsMap, fieldStateMap, isRowVisible, errors, }) => {
    return (_jsxs("div", { className: "space-y-4", children: [page.title && (_jsxs("div", { className: "border-b pb-3 mb-4", children: [_jsx("h2", { className: "text-xl font-bold tracking-tight text-foreground", children: page.title }), page.description && (_jsx("p", { className: "text-sm text-muted-foreground mt-1", children: page.description }))] })), _jsx("div", { className: "space-y-2", children: page.rowIds.map((rowId) => {
                    const row = schema.rows[rowId];
                    if (!row || !isRowVisible(row))
                        return null;
                    return (_jsx(FormRowRenderer, { row: row, columns: schema.columns, fields: schema.fields, visibleFieldsMap: visibleFieldsMap, fieldStateMap: fieldStateMap, errors: errors }, rowId));
                }) })] }));
};
