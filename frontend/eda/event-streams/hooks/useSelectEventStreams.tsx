import React, { useCallback } from 'react';
import { SourceEventStreamMappingModal } from '../../rulebook-activations/components/SourceEventStreamMapping';
import { EdaRulebook } from '../../interfaces/EdaRulebook';
import { EdaSourceEventMapping } from '../../interfaces/EdaSource';
import { usePageDialog } from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';

export function useSelectEventStreams(
  rulebookId: string,
  sourceMappings: EdaSourceEventMapping[],
  setSourceMappings: (sourceMappings: EdaSourceEventMapping[]) => void
) {
  const [_, setDialog] = usePageDialog();
  const { data } = useGet<EdaRulebook>(
    rulebookId ? `/api/eda/v1/rulebooks/`.concat(`${rulebookId}/`) : undefined
  );
  return useCallback(() => {
    setDialog(
      data ? (
        <SourceEventStreamMappingModal
          rulebook={data}
          mappings={sourceMappings}
          setSourceMappings={setSourceMappings}
        />
      ) : undefined
    );
  }, [data, setDialog, setSourceMappings, sourceMappings]);
}
