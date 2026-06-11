import { usePageDialog } from '@ansible/ansible-ui-framework';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useCallback } from 'react';
import { edaAPI } from '../../common/eda-utils';
import { EdaRulebook } from '../../interfaces/EdaRulebook';
import { EdaSourceEventMapping } from '../../interfaces/EdaSource';
import { SourceEventStreamMappingModal } from '../../rulebook-activations/components/SourceEventStreamMapping';

export function useSelectEventStreams(
  rulebookId: string,
  sourceMappings: EdaSourceEventMapping[],
  setSourceMappings: (sourceMappings: EdaSourceEventMapping[]) => void
) {
  const [_, setDialog] = usePageDialog();
  const { data } = useGet<EdaRulebook>(rulebookId ? edaAPI`/rulebooks/${rulebookId}/` : undefined);
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
