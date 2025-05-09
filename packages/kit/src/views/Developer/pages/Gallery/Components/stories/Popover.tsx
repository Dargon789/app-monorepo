/* eslint-disable react/no-unstable-nested-components */
import { useState } from 'react';

import {
  Button,
  Popover,
  SizableText,
  Stack,
  usePopoverContext,
} from '@onekeyhq/components';

import { Layout } from './utils/Layout';

const PopoverDemo = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover
      trackID="popover-demo"
      title="Popover Demo"
      open={isOpen}
      onOpenChange={setIsOpen}
      renderTrigger={<Button onPress={() => setIsOpen(true)}>Open</Button>}
      renderContent={
        <Stack gap="$4" p="$5">
          <SizableText>
            Non exercitation ea laborum cupidatat sunt amet aute exercitation
            occaecat minim incididunt non est est voluptate.
          </SizableText>
          <Button variant="primary" onPress={() => setIsOpen(false)}>
            Button
          </Button>
        </Stack>
      }
    />
  );
};

const Content = () => {
  const { closePopover } = usePopoverContext();
  return (
    <Stack gap="$4" p="$5">
      <SizableText>
        Non exercitation ea laborum cupidatat sunt amet aute exercitation
        occaecat minim incididunt non est est voluptate.
      </SizableText>
      <Button variant="primary" onPress={closePopover}>
        Button
      </Button>
    </Stack>
  );
};

const PopoverGallery = () => (
  <Layout
    filePath={__CURRENT_FILE_PATH__}
    componentName="Popover"
    elements={[
      {
        title: 'Controlled',
        element: <PopoverDemo />,
      },
      {
        title: 'Uncontrolled',
        element: () => (
          <Popover
            trackID="popover-demo-uncontrolled"
            title="Popover Demo"
            renderTrigger={<Button>Uncontrolled Open</Button>}
            renderContent={({ closePopover }) => (
              <Stack gap="$4" p="$5">
                <SizableText>
                  Non exercitation ea laborum cupidatat sunt amet aute
                  exercitation occaecat minim incididunt non est est voluptate.
                </SizableText>
                <Button variant="primary" onPress={closePopover}>
                  Button
                </Button>
              </Stack>
            )}
          />
        ),
      },
      {
        title: 'usePopoverContext',
        element: () => (
          <Popover
            trackID="popover-demo-usePopoverContext"
            title="Popover Demo"
            renderTrigger={<Button>Uncontrolled Open</Button>}
            renderContent={<Content />}
          />
        ),
      },
    ]}
  />
);

export default PopoverGallery;
