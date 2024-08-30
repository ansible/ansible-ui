import React, { useCallback } from 'react';
import { SourceEventStreamMappingModal } from '../../rulebook-activations/components/SourceEventStreamMapping';
import { EdaRulebook } from '../../interfaces/EdaRulebook';
import { EdaSourceEventMapping } from '../../interfaces/EdaSource';
import { usePageDialog } from '../../../../framework';

export function useSelectEventStreams(
  rulebook: EdaRulebook,
  sourceMappings: EdaSourceEventMapping[],
  setSourceMappings: (sourceMappings: EdaSourceEventMapping[]) => void
) {
  const [_, setDialog] = usePageDialog();
  const openSelectEventStreams = useCallback(() => {
    setDialog(
      <SourceEventStreamMappingModal
        rulebook={rulebook}
        mappings={sourceMappings}
        setSourceMappings={setSourceMappings}
      />
    );
  }, [rulebook, setDialog, setSourceMappings, sourceMappings]);
  return openSelectEventStreams;
}
