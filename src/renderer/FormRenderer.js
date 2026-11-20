import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FormProvider } from 'react-hook-form';
import { useFormEngine } from './useFormEngine';
import { FormPageRenderer } from './FormPage';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '../ui/utils';
export const FormRenderer = ({ schema, defaultValues, onSubmit, className, cardWrapper = true, }) => {
    const engine = useFormEngine({
        schema,
        defaultValues,
        onSubmit,
    });
    const { form, currentPageIndex, currentPage, isFirstPage, isLastPage, progressPercentage, visiblePages, visibleFieldsMap, fieldStateMap, isRowVisible, goToNextPage, goToPrevPage, goToPage, handleSubmit, } = engine;
    const errors = form.formState.errors;
    const isMultiPage = visiblePages.length > 1;
    const submitText = schema.settings?.submitButtonText || 'Submit';
    const showReset = schema.settings?.showResetButton || false;
    const resetText = schema.settings?.resetButtonText || 'Reset';
    const content = (_jsx(FormProvider, { ...form, children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [isMultiPage && schema.settings?.showProgressBar && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center text-xs font-medium text-muted-foreground", children: [_jsxs("span", { children: ["Step ", currentPageIndex + 1, " of ", visiblePages.length, ":", ' ', _jsx("strong", { className: "text-foreground", children: currentPage?.title })] }), _jsxs("span", { children: [progressPercentage, "%"] })] }), _jsx("div", { className: "h-1.5 w-full overflow-hidden rounded-full bg-secondary", children: _jsx("div", { className: "h-full bg-primary transition-all duration-300 ease-in-out", style: { width: `${progressPercentage}%` } }) }), schema.settings?.allowPageNavigation && (_jsx("div", { className: "flex space-x-1 pt-2 overflow-x-auto", children: visiblePages.map((page, idx) => (_jsxs("button", { type: "button", onClick: () => goToPage(idx), className: cn('px-3 py-1 text-xs rounded-md font-medium transition-colors', idx === currentPageIndex
                                    ? 'bg-primary text-primary-foreground'
                                    : idx < currentPageIndex
                                        ? 'bg-muted text-foreground hover:bg-accent'
                                        : 'text-muted-foreground hover:bg-muted'), children: [idx + 1, ". ", page.title] }, page.id))) }))] })), currentPage && (_jsx(FormPageRenderer, { page: currentPage, schema: schema, visibleFieldsMap: visibleFieldsMap, fieldStateMap: fieldStateMap, isRowVisible: isRowVisible, errors: errors })), _jsxs("div", { className: "flex items-center justify-between pt-4 border-t", children: [_jsx("div", { children: showReset && (_jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: () => form.reset(), children: resetText })) }), _jsxs("div", { className: "flex items-center space-x-2", children: [isMultiPage && !isFirstPage && (_jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: goToPrevPage, children: [_jsx(ChevronLeft, { className: "h-4 w-4 mr-1" }), "Previous"] })), isMultiPage && !isLastPage ? (_jsxs(Button, { type: "button", size: "sm", onClick: goToNextPage, children: ["Next", _jsx(ChevronRight, { className: "h-4 w-4 ml-1" })] })) : (_jsxs(Button, { type: "submit", size: "sm", children: [_jsx(Check, { className: "h-4 w-4 mr-1" }), submitText] }))] })] })] }) }));
    if (cardWrapper) {
        return (_jsxs(Card, { className: cn('w-full shadow-sm', className), children: [(schema.title || schema.description) && (_jsxs(CardHeader, { children: [schema.title && _jsx(CardTitle, { children: schema.title }), schema.description && (_jsx(CardDescription, { children: schema.description }))] })), _jsx(CardContent, { children: content })] }));
    }
    return _jsx("div", { className: cn('w-full', className), children: content });
};
