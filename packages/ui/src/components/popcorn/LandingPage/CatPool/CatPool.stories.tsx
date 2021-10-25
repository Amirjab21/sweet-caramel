import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';
import { CatPool } from '.';
import Container from '../../Grid/FullHeightContainer';

export default {
  title: 'Animations/CatPool',
  component: CatPool,
  decorators: [
    (Story) => (
      <Container>
        <Story />
      </Container>
    ),
  ],
} as Meta;

const Template: Story = (args) => <CatPool />;

export const Primary = Template.bind({});
Primary.args = {};
