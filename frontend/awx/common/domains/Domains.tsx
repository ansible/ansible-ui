import { Help, PageForm, PageFormTextInput } from '@ansible/ansible-ui-framework';
import { ExpandIcon } from '@ansible/ansible-ui-framework/components/icons/ExpandIcon';
import {
  Button,
  Divider,
  Flex,
  FlexItem,
  FormFieldGroup,
  FormFieldGroupHeader,
  Label,
  Modal,
  ModalVariant,
  Split,
  SplitItem,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import { AddCircleOIcon, CloseIcon, TrashIcon, WrenchIcon } from '@patternfly/react-icons';
import { useState } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { PageFormLabelSelect } from '../PageFormLabelSelect';
import { IDomain, useDomainsStore } from './useDomains';

export function Domains() {
  const { t } = useTranslation();
  const { domains, activeDomains, toggleActiveDomain, clearActiveDomains } = useDomainsStore();
  const [configureOpen, setConfigureOpen] = useState(false);
  return (
    <>
      <Flex
        style={{ padding: 24, paddingTop: 12, paddingBottom: 12 }}
        spaceItems={{ default: 'spaceItemsSm' }}
      >
        <FlexItem>
          <Split>
            <SplitItem>{t('Domains')}</SplitItem>
            <div style={{ color: 'var(--pf-v5-global--link--Color)', marginTop: -6 }}>
              <Help
                title={t('Domains')}
                help={[
                  t('Domains allow you to select your specific areas of interest.'),
                  t('This then filters the current view based on the labels for that domain.'),
                ]}
              />
            </div>
          </Split>
        </FlexItem>
        {domains.map((domain, index) => (
          <FlexItem key={index}>
            <ToggleGroup>
              <ToggleGroupItem
                text={domain.name}
                isSelected={
                  activeDomains.find((activeDomain) => activeDomain.name === domain.name) !==
                  undefined
                }
                onClick={() => toggleActiveDomain(domain)}
              />
            </ToggleGroup>
          </FlexItem>
        ))}
        <FlexItem>
          <Button
            icon={<WrenchIcon />}
            variant="plain"
            onClick={() => setConfigureOpen(true)}
            aria-label={t('Configure Domains')}
          />
          {activeDomains.length > 0 && (
            <Button
              icon={<CloseIcon />}
              aria-label={t('Clear Active Domains')}
              variant="plain"
              onClick={clearActiveDomains}
            />
          )}
        </FlexItem>
      </Flex>
      <Divider />
      <ConfigureDomainsModal isOpen={configureOpen} setOpen={setConfigureOpen} />
    </>
  );
}

function ConfigureDomainsModal(props: { isOpen: boolean; setOpen: (open: boolean) => void }) {
  const { isOpen, setOpen } = props;
  const { domains, setDomains } = useDomainsStore();
  const { t } = useTranslation();
  return (
    <Modal
      title={t('Domains')}
      isOpen={isOpen}
      onClose={() => setOpen(false)}
      ouiaId="Domains"
      variant={ModalVariant.small}
      hasNoBodyWrapper
      description={
        <div style={{ paddingBottom: 24 }}>{t('Configure domains for filtering the views.')}</div>
      }
    >
      <PageForm
        singleColumn
        submitText={t('Submit')}
        onSubmit={(data) => {
          setDomains(data.fields.filter((fa) => !!fa.name));
          setOpen(false);
          return Promise.resolve();
        }}
        cancelText={t('Cancel')}
        onCancel={() => setOpen(false)}
        defaultValue={{ fields: domains }}
        disablePadding
      >
        <ConfigureDomains />
      </PageForm>
    </Modal>
  );
}

function ConfigureDomains() {
  const { append } = useFieldArray({ name: 'fields' });
  const fields = useWatch({ name: 'fields' }) as IDomain[];
  const { t } = useTranslation();
  return (
    <>
      {fields.map((_, index) => (
        <ConfigureDomain key={index} index={index} />
      ))}
      <Button
        type="button"
        variant="link"
        icon={<AddCircleOIcon />}
        onClick={() => append({ name: '', labels: [] })}
        style={{ marginBottom: 16 }}
      >
        {t('Add Domain')}
      </Button>
    </>
  );
}

function ConfigureDomain(props: { index: number }) {
  const { remove } = useFieldArray({ name: 'fields' });
  const value = useWatch({ name: `fields.${props.index}` }) as IDomain;
  const [isExpanded, setIsExpanded] = useState(() => !value.name);
  const { t } = useTranslation();
  return (
    <ExpandableFormFieldGroup
      header={
        <FormFieldGroupHeader
          titleText={{
            text: (
              <div style={{ display: 'flex', gap: 8, paddingBottom: 6, paddingTop: 4 }}>
                <div>
                  <ExpandIcon isExpanded={isExpanded} setExpanded={setIsExpanded} />
                </div>
                {!isExpanded && <ConfigureDomainName name={`fields.${props.index}`} />}
              </div>
            ),
            id: `fields.${props.index}`,
          }}
          titleDescription={
            !isExpanded ? (
              <Flex
                alignItems={{ default: 'alignItemsCenter' }}
                spaceItems={{ default: 'spaceItemsSm' }}
                style={{ paddingLeft: 20 }}
              >
                <ConfigureDomainLabels name={`fields.${props.index}`} />
              </Flex>
            ) : null
          }
          actions={
            isExpanded ? undefined : (
              <Button variant="plain" aria-label="Remove" onClick={() => remove(props.index)}>
                <TrashIcon />
              </Button>
            )
          }
        />
      }
      isExpanded={isExpanded}
    >
      {isExpanded && (
        <>
          <PageFormTextInput
            name={`fields.${props.index}.name`}
            label={t('Name')}
            isRequired
            shouldUnregister={false}
          />
          <PageFormLabelSelect
            name={`fields.${props.index}.labels`}
            placeholderText={t('Select labels')}
            shouldUnregister={false}
          />
        </>
      )}
    </ExpandableFormFieldGroup>
  );
}

function ConfigureDomainName(props: { name: string }) {
  const domain = useWatch({ name: props.name }) as IDomain;
  return domain?.name;
}

function ConfigureDomainLabels(props: { name: string }) {
  const domain = useWatch({ name: props.name }) as IDomain;
  return <>{domain?.labels?.map((label) => <Label key={label.name}>{label.name}</Label>)}</>;
}

// hide child .pf-v5-c-form__field-group-body when not expanded
const ExpandableFormFieldGroup = styled(FormFieldGroup)<{ isExpanded?: boolean }>`
  margin-left: 16px;
  .pf-v5-c-form__field-group-body {
    display: ${(props) => (props.isExpanded ? 'grid' : 'none')};
    margin-top: -54px;
    padding-top: 8px;
    margin-left: -28px;
    padding-right: 16px;
  }
`;
