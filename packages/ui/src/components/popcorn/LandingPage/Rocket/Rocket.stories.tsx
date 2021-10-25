import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';
import { Rocket } from '.';
import Container from '../../Grid/FullHeightContainer';

export default {
  title: 'Animations/Rocket',
  component: Rocket,
  decorators: [
    (Story) => (
      <Container>
        <Story />
      </Container>
    ),
  ],
} as Meta;

const Template: Story = (args) => <Rocket />;

export const Primary = Template.bind({});
Primary.args = {};
