import React, { useContext } from "react";
import BaseControl, { ControlProps } from "./BaseControl";
import { StyledDynamicInput } from "./StyledControls";
import { InputType } from "components/constants";
import CodeEditor, {
  CodeEditorExpected,
} from "components/editorComponents/CodeEditor";
import {
  CodeEditorBorder,
  EditorModes,
  EditorSize,
  EditorTheme,
  TabBehaviour,
} from "components/editorComponents/CodeEditor/EditorConfig";
import { CollapseContext } from "pages/Editor/PropertyPane/PropertySection";

export function InputText(props: {
  label: string;
  value: string;
  onBlur?: () => void;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement> | string) => void;
  onFocus?: () => void;
  evaluatedValue?: any;
  expected?: CodeEditorExpected;
  placeholder?: string;
  dataTreePath?: string;
  additionalAutocomplete?: Record<string, Record<string, unknown>>;
  theme?: EditorTheme;
  hideEvaluatedValue?: boolean;
}) {
  const {
    dataTreePath,
    evaluatedValue,
    expected,
    hideEvaluatedValue,
    onBlur,
    onChange,
    onFocus,
    placeholder,
    value,
  } = props;

  //subscribing to context to help re-render component on Property section open or close
  const isOpen = useContext(CollapseContext);

  return (
    <StyledDynamicInput>
      <CodeEditor
        additionalDynamicData={props.additionalAutocomplete}
        border={CodeEditorBorder.ALL_SIDE}
        dataTreePath={dataTreePath}
        evaluatedValue={evaluatedValue}
        expected={expected}
        hideEvaluatedValue={hideEvaluatedValue}
        hoverInteraction
        input={{
          value: value,
          onChange: onChange,
        }}
        isEditorHidden={!isOpen}
        mode={EditorModes.TEXT_WITH_BINDING}
        onEditorBlur={onBlur}
        onEditorFocus={onFocus}
        placeholder={placeholder}
        size={EditorSize.EXTENDED}
        tabBehaviour={TabBehaviour.INDENT}
        theme={props.theme || EditorTheme.LIGHT}
      />
    </StyledDynamicInput>
  );
}

class InputTextControl extends BaseControl<InputControlProps> {
  render() {
    const {
      additionalAutoComplete,
      dataTreePath,
      defaultValue,
      expected,
      hideEvaluatedValue,
      label,
      onBlur,
      onFocus,
      placeholderText,
      propertyValue,
    } = this.props;

    return (
      <InputText
        additionalAutocomplete={additionalAutoComplete}
        dataTreePath={dataTreePath}
        expected={expected}
        hideEvaluatedValue={hideEvaluatedValue}
        label={label}
        onBlur={onBlur}
        onChange={this.onTextChange}
        onFocus={onFocus}
        placeholder={placeholderText}
        theme={this.props.theme}
        value={propertyValue ? propertyValue : defaultValue}
      />
    );
  }

  isNumberType(): boolean {
    const { inputType } = this.props;
    switch (inputType) {
      case "CURRENCY":
      case "INTEGER":
      case "NUMBER":
      case "PHONE_NUMBER":
        return true;
      default:
        return false;
    }
  }

  onTextChange = (event: React.ChangeEvent<HTMLTextAreaElement> | string) => {
    let value = event;
    if (typeof event !== "string") {
      value = event.target.value;
    }
    this.updateProperty(this.props.propertyName, value);
  };

  static getControlType() {
    return "INPUT_TEXT";
  }
}

export interface InputControlProps extends ControlProps {
  placeholderText: string;
  inputType: InputType;
  validationMessage?: string;
  isDisabled?: boolean;
  defaultValue?: any;
  onFocus?: () => void;
  onBlur?: () => void;
}

export default InputTextControl;
