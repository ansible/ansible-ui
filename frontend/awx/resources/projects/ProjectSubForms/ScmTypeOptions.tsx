import { useTranslation } from 'react-i18next';
import { Help, PageFormCheckbox, PageFormTextInput } from '../../../../../framework';
import { PageFormHidden } from '../../../../../framework/PageForm/Utils/PageFormHidden';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { Project } from '../../../interfaces/Project';

export function ScmTypeOptions(props: { hideAllowOverride?: boolean }) {
  const { t } = useTranslation();
  return (
    <PageFormSection title={t('Options')}>
      <PageFormCheckbox<Project>
        id="option-scm-clean"
        label={
          <span>
            {t('Clean')}
            &nbsp;
            <Help help={t('Remove any local modifications prior to performing an update.')} />
          </span>
        }
        name="scm_clean"
      />
      <PageFormCheckbox<Project>
        id="option-scm-delete-on-update"
        label={
          <span>
            {t('Delete')}
            &nbsp;
            <Help
              help={t(
                'Delete the local repository in its entirety prior to performing an update. Depending on the size of the repository this may significantly increase the amount of time required to complete an update.'
              )}
            />
          </span>
        }
        name="scm_delete_on_update"
      />
      <PageFormHidden watch="scm_type" hidden={(type: string) => type !== 'git'}>
        <PageFormCheckbox<Project>
          id="option-scm-track-submodules"
          label={
            <span>
              {t('Track submodules')}
              &nbsp;
              <Help
                help={t(
                  'Submodules will track the latest commit on their master branch (or other branch specified in .gitmodules). If no, submodules will be kept at the revision specified by the main project. This is equivalent to specifying the --remote flag to git submodule update.'
                )}
              />
            </span>
          }
          name="scm_track_submodules"
        />
      </PageFormHidden>
      <PageFormCheckbox<Project>
        id="option-scm-update-on-launch"
        label={
          <span>
            {t('Update Revision on Launch')}
            &nbsp;
            <Help
              help={t(
                'Each time a job runs using this project, update the revision of the project prior to starting the job.'
              )}
            />
          </span>
        }
        name="scm_update_on_launch"
      />
      {!props.hideAllowOverride && (
        <PageFormCheckbox<Project>
          id="option-allow-override"
          label={
            <span>
              {t('Allow Branch Override')}
              &nbsp;
              <Help
                help={t(
                  'Allow changing the Source Control branch or revision in a job template that uses this project.'
                )}
              />
            </span>
          }
          name="allow_override"
        />
      )}
      <PageFormHidden
        watch="scm_update_on_launch"
        hidden={(scmUpdateOnLaunch?: boolean) => !scmUpdateOnLaunch}
      >
        <PageFormSection title={t('Option Details')}>
          <PageFormTextInput<Project>
            name="scm_update_cache_timeout"
            type="number"
            labelHelp={t(
              'Time in seconds to consider a project to be current. During job runs and callbacks the task system will evaluate the timestamp of the latest project update. If it is older than Cache Timeout, it is not considered current, and a new project update will be performed.'
            )}
            label={t('Cache Timeout')}
            min="0"
          />
        </PageFormSection>
      </PageFormHidden>
    </PageFormSection>
  );
}
