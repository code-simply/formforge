export function evaluateOperator(operator, actualValue, expectedValue) {
    switch (operator) {
        case 'equals':
            return actualValue === expectedValue || String(actualValue ?? '') === String(expectedValue ?? '');
        case 'notEquals':
            return actualValue !== expectedValue && String(actualValue ?? '') !== String(expectedValue ?? '');
        case 'contains':
            if (Array.isArray(actualValue)) {
                return actualValue.includes(expectedValue);
            }
            return String(actualValue ?? '').toLowerCase().includes(String(expectedValue ?? '').toLowerCase());
        case 'notContains':
            if (Array.isArray(actualValue)) {
                return !actualValue.includes(expectedValue);
            }
            return !String(actualValue ?? '').toLowerCase().includes(String(expectedValue ?? '').toLowerCase());
        case 'startsWith':
            return String(actualValue ?? '').startsWith(String(expectedValue ?? ''));
        case 'endsWith':
            return String(actualValue ?? '').endsWith(String(expectedValue ?? ''));
        case 'greaterThan':
            return Number(actualValue) > Number(expectedValue);
        case 'greaterThanOrEqual':
            return Number(actualValue) >= Number(expectedValue);
        case 'lessThan':
            return Number(actualValue) < Number(expectedValue);
        case 'lessThanOrEqual':
            return Number(actualValue) <= Number(expectedValue);
        case 'isEmpty':
            if (actualValue === null || actualValue === undefined)
                return true;
            if (typeof actualValue === 'string')
                return actualValue.trim() === '';
            if (Array.isArray(actualValue))
                return actualValue.length === 0;
            if (typeof actualValue === 'object')
                return Object.keys(actualValue).length === 0;
            return false;
        case 'isNotEmpty':
            return !evaluateOperator('isEmpty', actualValue, expectedValue);
        case 'in':
            if (Array.isArray(expectedValue)) {
                return expectedValue.includes(actualValue);
            }
            return String(expectedValue ?? '').split(',').map((s) => s.trim()).includes(String(actualValue ?? ''));
        case 'notIn':
            return !evaluateOperator('in', actualValue, expectedValue);
        default:
            return false;
    }
}
export function evaluateRule(rule, formValues, fieldsMap) {
    const targetField = fieldsMap[rule.fieldId];
    const targetKey = targetField?.name || rule.fieldId;
    const actualValue = formValues[targetKey];
    return evaluateOperator(rule.operator, actualValue, rule.value);
}
export function evaluateConditionGroup(group, formValues, fieldsMap) {
    if (!group.rules || group.rules.length === 0)
        return true;
    if (group.logic === 'OR') {
        return group.rules.some((rule) => evaluateRule(rule, formValues, fieldsMap));
    }
    return group.rules.every((rule) => evaluateRule(rule, formValues, fieldsMap));
}
export function evaluateFieldConditions(field, formValues, fieldsMap) {
    const state = {
        visible: true,
        disabled: !!field.disabled,
        required: !!field.required,
    };
    if (!field.conditions || field.conditions.length === 0) {
        return state;
    }
    for (const group of field.conditions) {
        const isMatched = evaluateConditionGroup(group, formValues, fieldsMap);
        switch (group.action) {
            case 'show':
                state.visible = isMatched;
                break;
            case 'hide':
                state.visible = !isMatched;
                break;
            case 'enable':
                state.disabled = !isMatched;
                break;
            case 'disable':
                state.disabled = isMatched;
                break;
            case 'require':
                state.required = isMatched;
                break;
        }
    }
    return state;
}
export function evaluateRowConditions(row, formValues, fieldsMap) {
    if (!row.conditions || row.conditions.length === 0)
        return true;
    for (const group of row.conditions) {
        const isMatched = evaluateConditionGroup(group, formValues, fieldsMap);
        if (group.action === 'show' && !isMatched)
            return false;
        if (group.action === 'hide' && isMatched)
            return false;
    }
    return true;
}
export function evaluatePageConditions(page, formValues, fieldsMap) {
    if (!page.conditions || page.conditions.length === 0)
        return true;
    for (const group of page.conditions) {
        const isMatched = evaluateConditionGroup(group, formValues, fieldsMap);
        if (group.action === 'show' && !isMatched)
            return false;
        if (group.action === 'hide' && isMatched)
            return false;
    }
    return true;
}
