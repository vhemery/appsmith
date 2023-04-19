import * as Sentry from "@sentry/react";
import React from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "design-system";
import { ConversionForm } from "./ConversionForm";
import { useDispatch, useSelector } from "react-redux";
import { getIsAutoLayout } from "selectors/canvasSelectors";
import {
  CONVERT_TO_AUTO_BUTTON,
  CONVERT_TO_AUTO_TITLE,
  CONVERT_TO_FIXED_BUTTON,
  CONVERT_TO_FIXED_TITLE,
  createMessage,
} from "@appsmith/constants/messages";
import BetaCard from "components/editorComponents/BetaCard";
import store from "store";
import {
  setConversionStart,
  setConversionStop,
} from "actions/autoLayoutActions";
import { CONVERSION_STATES } from "reducers/uiReducers/layoutConversionReducer";
import { useConversionForm } from "./hooks/useConversionForm";
import type { AppState } from "ce/reducers";

function ConversionButton() {
  const [showModal, setShowModal] = React.useState(false);
  const isAutoLayout = getIsAutoLayout(store.getState());
  const formProps = useConversionForm({ isAutoLayout });
  const dispatch = useDispatch();

  const conversionState = useSelector(
    (state: AppState) => state.ui.layoutConversion.conversionState,
  );

  //Text base on if it is an Auto layout
  const titleText = isAutoLayout
    ? CONVERT_TO_FIXED_TITLE
    : CONVERT_TO_AUTO_TITLE;
  const buttonText = isAutoLayout
    ? CONVERT_TO_FIXED_BUTTON
    : CONVERT_TO_AUTO_BUTTON;

  const closeModal = (isOpen: boolean) => {
    if (!isOpen) {
      setShowModal(false);
      dispatch(setConversionStop());
    }
  };

  const openModal = () => {
    setShowModal(true);
    dispatch(setConversionStart(CONVERSION_STATES.START));
  };

  const isConversionCompleted =
    conversionState === CONVERSION_STATES.COMPLETED_SUCCESS;

  return (
    <>
      <Button
        className="w-full !mb-5"
        id="t--layout-conversion-cta"
        kind="secondary"
        onClick={openModal}
        size="md"
      >
        {createMessage(buttonText)}
      </Button>
      <Modal onOpenChange={closeModal} open={showModal}>
        <ModalContent>
          <ModalHeader isCloseButtonVisible={!isConversionCompleted}>
            {!isConversionCompleted && (
              <div className="flex items-center gap-3">
                {createMessage(titleText)}
                <BetaCard />
              </div>
            )}
          </ModalHeader>
          <ModalBody>
            <ConversionForm {...formProps} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

ConversionButton.displayName = "ConversionButton";

export default React.memo(Sentry.withProfiler(ConversionButton));
