import { jsx as _jsx } from "react/jsx-runtime";
import { FormFieldRenderer } from './FormField';
import { cn } from '../ui/utils';
export const FormRowRenderer = ({ row, columns, fields, visibleFieldsMap, fieldStateMap, errors, }) => {
    return (_jsx("div", { className: cn('grid grid-cols-12 gap-4 py-2', row.className), children: row.columnIds.map((colId) => {
            const column = columns[colId];
            if (!column)
                return null;
            // Calculate Tailwind grid col span class
            const span = Math.min(Math.max(column.width || 12, 1), 12);
            const colSpanClass = span === 1
                ? 'col-span-12 sm:col-span-1'
                : span === 2
                    ? 'col-span-12 sm:col-span-2'
                    : span === 3
                        ? 'col-span-12 sm:col-span-3'
                        : span === 4
                            ? 'col-span-12 sm:col-span-4'
                            : span === 5
                                ? 'col-span-12 sm:col-span-5'
                                : span === 6
                                    ? 'col-span-12 sm:col-span-6'
                                    : span === 7
                                        ? 'col-span-12 sm:col-span-7'
                                        : span === 8
                                            ? 'col-span-12 sm:col-span-8'
                                            : span === 9
                                                ? 'col-span-12 sm:col-span-9'
                                                : span === 10
                                                    ? 'col-span-12 sm:col-span-10'
                                                    : span === 11
                                                        ? 'col-span-12 sm:col-span-11'
                                                        : 'col-span-12';
            return (_jsx("div", { className: cn('flex flex-col space-y-3', colSpanClass, column.className), children: column.fieldIds.map((fId) => {
                    if (!visibleFieldsMap[fId])
                        return null;
                    const field = fields[fId];
                    if (!field)
                        return null;
                    const state = fieldStateMap[fId];
                    const errorObj = errors[field.name || field.id];
                    const errorMessage = errorObj?.message ? String(errorObj.message) : undefined;
                    return (_jsx(FormFieldRenderer, { field: field, disabled: state?.disabled, required: state?.required, error: errorMessage }, fId));
                }) }, colId));
        }) }));
};
