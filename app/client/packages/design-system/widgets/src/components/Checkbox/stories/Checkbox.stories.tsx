import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox, Flex } from "@design-system/widgets";

/**
 * Checkbox is a component that allows the user to select one or more options from a set.
 */
const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
  title: "Design-system/Widgets/Checkbox",
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Main: Story = {
  args: {
    children: "Check me",
  },
};

export const States: Story = {
  render: () => (
    <Flex direction="column" gap="spacing-4">
      <Checkbox>Unchecked</Checkbox>
      <Checkbox defaultSelected>Checked</Checkbox>
      <Checkbox isDisabled>Disabled</Checkbox>
      <Checkbox defaultSelected isDisabled>
        Disabled checked
      </Checkbox>
      <Checkbox isIndeterminate>Indeterminate</Checkbox>
      <Checkbox validationState="invalid">Error</Checkbox>
    </Flex>
  ),
};

/**
 * The component supports two label positions `start` and `end`. Default size is `end`.
 */
export const LabelPosition: Story = {
  render: () => (
    <Flex direction="column" gap="1rem" wrap="wrap">
      <Checkbox>Label Position — end</Checkbox>
      <Checkbox labelPosition="start">Label Position — start</Checkbox>
    </Flex>
  ),
};

export const CustomIcon: Story = {
  render: () => (
    <Flex gap="1rem" wrap="wrap">
      <Checkbox
        defaultSelected
        icon={(props) => {
          return (
            <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
              <path d="M17.8827 19.2968C16.1814 20.3755 14.1638 21.0002 12.0003 21.0002C6.60812 21.0002 2.12215 17.1204 1.18164 12.0002C1.61832 9.62282 2.81932 7.5129 4.52047 5.93457L1.39366 2.80777L2.80788 1.39355L22.6069 21.1925L21.1927 22.6068L17.8827 19.2968ZM5.9356 7.3497C4.60673 8.56015 3.6378 10.1672 3.22278 12.0002C4.14022 16.0521 7.7646 19.0002 12.0003 19.0002C13.5997 19.0002 15.112 18.5798 16.4243 17.8384L14.396 15.8101C13.7023 16.2472 12.8808 16.5002 12.0003 16.5002C9.51498 16.5002 7.50026 14.4854 7.50026 12.0002C7.50026 11.1196 7.75317 10.2981 8.19031 9.60442L5.9356 7.3497ZM12.9139 14.328L9.67246 11.0866C9.5613 11.3696 9.50026 11.6777 9.50026 12.0002C9.50026 13.3809 10.6196 14.5002 12.0003 14.5002C12.3227 14.5002 12.6309 14.4391 12.9139 14.328ZM20.8068 16.5925L19.376 15.1617C20.0319 14.2268 20.5154 13.1586 20.7777 12.0002C19.8603 7.94818 16.2359 5.00016 12.0003 5.00016C11.1544 5.00016 10.3329 5.11773 9.55249 5.33818L7.97446 3.76015C9.22127 3.26959 10.5793 3.00016 12.0003 3.00016C17.3924 3.00016 21.8784 6.87992 22.8189 12.0002C22.5067 13.6998 21.8038 15.2628 20.8068 16.5925ZM11.7229 7.50857C11.8146 7.50299 11.9071 7.50016 12.0003 7.50016C14.4855 7.50016 16.5003 9.51488 16.5003 12.0002C16.5003 12.0933 16.4974 12.1858 16.4919 12.2775L11.7229 7.50857Z" />
            </svg>
          );
        }}
      >
        Option 1
      </Checkbox>
    </Flex>
  ),
};
