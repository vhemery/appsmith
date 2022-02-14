import { AutocompleteDataType } from "utils/autocomplete/TernServer";

const RULES: Record<AutocompleteDataType, Array<string>> = {
  STRING: [
    "INPUT_WIDGET_V2.text",
    "PHONE_INPUT_WIDGET.text",
    "PHONE_INPUT_WIDGET.countryCode",
    "PHONE_INPUT_WIDGET.currencyCode",
    "CURRENCY_INPUT_WIDGET.text",
    "CURRENCY_INPUT_WIDGET.countryCode",
    "CURRENCY_INPUT_WIDGET.dialCode",
    "RICH_TEXT_EDITOR_WIDGET.text",
    "DROP_DOWN_WIDGET.selectedOptionValue",
    "DATE_PICKER_WIDGET_2.selectedDate",
    "DATE_PICKER_WIDGET_2.formattedDate",
    "TABLE_WIDGET.pageNo",
    "TABLE_WIDGET.searchText",
    "TABLE_WIDGET.pageSize",
    "TABS_WIDGET.selectedTab",
    "TABLE_WIDGET.selectedRowIndex",
    "IFRAME_WIDGET.source",
    "IFRAME_WIDGET.title",
    "DROP_DOWN_WIDGET.selectedOptionLabel",
    "SELECT_WIDGET.selectedOptionLabel",
    "SELECT_WIDGET.selectedOptionValue",
    "BUTTON_WIDGET.recaptchaToken",
    "IMAGE_WIDGET.image",
    "TEXT_WIDGET.text",
    "BUTTON_WIDGET.text",
    "CHART_WIDGET.xAxisName",
    "CHART_WIDGET.yAxisName",
    "CONTAINER_WIDGET.backgroundColor",
    "BUTTON_WIDGET.googleRecaptchaKey",
  ],
  NUMBER: [
    "TABLE_WIDGET.pageNo",
    "TABLE_WIDGET.pageSize",
    "INPUT_WIDGET_V2.text",
    "CURRENCY_INPUT_WIDGET.value",
    "TABLE_WIDGET.selectedRowIndex",
    "RICH_TEXT_EDITOR_WIDGET.text",
    "DROP_DOWN_WIDGET.selectedOptionValue",
    "DATE_PICKER_WIDGET_2.selectedDate",
    "DATE_PICKER_WIDGET_2.formattedDate",
    "TABLE_WIDGET.searchText",
    "TABS_WIDGET.selectedTab",
    "IFRAME_WIDGET.source",
    "IFRAME_WIDGET.title",
    "DROP_DOWN_WIDGET.selectedOptionLabel",
    "IMAGE_WIDGET.image",
    "TEXT_WIDGET.text",
    "BUTTON_WIDGET.text",
    "CHART_WIDGET.xAxisName",
    "CHART_WIDGET.yAxisName",
    "CONTAINER_WIDGET.backgroundColor",
    "PROGRESSBAR_WIDGET.progress",
    "SELECT_WIDGET.selectedOptionLabel",
    "SELECT_WIDGET.selectedOptionValue",
    "MULTI_SELECT_WIDGET_V2.selectedOptionLabel",
    "MULTI_SELECT_WIDGET_V2.selectedOptionValue",
    "CIRCULAR_PROGRESS_WIDGET.progress",
  ],
  OBJECT: ["ACTION.data"],
  ARRAY: ["ACTION.data", "TABLE_WIDGET.selectedRowIndices"],
  BOOLEAN: [
    "CHECKBOX_WIDGET.isChecked",
    "SWITCH_WIDGET.isSwitchedOn",
    "CONTAINER_WIDGET.isVisible",
    "INPUT_WIDGET_V2.isVisible",
    "PHONE_INPUT_WIDGET.isVisible",
    "CURRENCY_INPUT_WIDGET.isVisible",
    "TABLE_WIDGET.isVisible",
    "DROP_DOWN_WIDGET.isVisible",
    "IMAGE_WIDGET.isVisible",
    "TEXT_WIDGET.isVisible",
    "BUTTON_WIDGET.isVisible",
    "DATE_PICKER_WIDGET2.isVisible",
    "CHECKBOX_WIDGET.isVisible",
    "SWITCH_WIDGET.isVisible",
    "RADIO_GROUP_WIDGET.isVisible",
    "TABS_WIDGET.isVisible",
    "MODAL_WIDGET.isVisible",
    "RICH_TEXT_EDITOR_WIDGET.isVisible",
    "FORM_WIDGET.isVisible",
    "FILE_PICKER_WIDGET.isVisible",
    "LIST_WIDGET.isVisible",
    "RATE_WIDGET.isVisible",
    "IFRAME_WIDGET.isVisible",
    "DIVIDER_WIDGET.isVisible",
    "INPUT_WIDGET_V2.isValid",
    "INPUT_WIDGET_V2.isDisabled",
    "PHONE_INPUT_WIDGET.isValid",
    "PHONE_INPUT_WIDGET.isDisabled",
    "CURRENCY_INPUT_WIDGET.isValid",
    "CURRENCY_INPUT_WIDGET.isDisabled",
    "DROP_DOWN_WIDGET.isDisabled",
    "BUTTON_WIDGET.isDisabled",
    "DATE_PICKER_WIDGET2.isDisabled",
    "CHECKBOX_WIDGET.isDisabled",
    "SWITCH_WIDGET.isDisabled",
    "RICH_TEXT_EDITOR_WIDGET.isDisabled",
    "FILE_PICKER_WIDGET.isRequired",
    "MODAL_WIDGET.isOpen",
    "PROGRESSBAR_WIDGET.isVisible",
    "SELECT_WIDGET.isVisible",
    "SELECT_WIDGET.isDisabled",
    "MULTI_SELECT_WIDGET_V2.isVisible",
    "MULTI_SELECT_WIDGET_V2.isDisabled",
    "CIRCULAR_PROGRESS_WIDGET.isVisible",
  ],
  FUNCTION: [
    "ACTION.run()",
    "storeValue()",
    "showAlert()",
    "navigateTo()",
    "resetWidget()",
    "download()",
    "showModal()",
  ],
  UNKNOWN: [],
};

export default RULES;
