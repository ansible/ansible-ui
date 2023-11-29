import { QuickStart } from '@patternfly/quickstarts';
import { useTranslation } from 'react-i18next';

export function useExampleQuickStart() {
  const { t } = useTranslation();
  const exampleQuickStart: QuickStart = {
    metadata: {
      name: t('getting-started-with-quick-starts'),
      instructional: true,
    },
    spec: {
      displayName: t('Getting started with quick starts'),
      durationMinutes: 10,
      type: {
        text: t('Type'),
        color: 'grey',
      },
      icon: 'data:image/svg+xml;base64,PCEtLSBHZW5lcmF0ZWQgYnkgSWNvTW9vbi5pbyAtLT4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj4KPHRpdGxlPjwvdGl0bGU+CjxnIGlkPSJpY29tb29uLWlnbm9yZSI+CjwvZz4KPHBhdGggZD0iTTQ0OCA2NHY0MTZoLTMzNmMtMjYuNTEzIDAtNDgtMjEuNDktNDgtNDhzMjEuNDg3LTQ4IDQ4LTQ4aDMwNHYtMzg0aC0zMjBjLTM1LjE5OSAwLTY0IDI4LjgtNjQgNjR2Mzg0YzAgMzUuMiAyOC44MDEgNjQgNjQgNjRoMzg0di00NDhoLTMyeiI+PC9wYXRoPgo8cGF0aCBkPSJNMTEyLjAyOCA0MTZ2MGMtMC4wMDkgMC4wMDEtMC4wMTkgMC0wLjAyOCAwLTguODM2IDAtMTYgNy4xNjMtMTYgMTZzNy4xNjQgMTYgMTYgMTZjMC4wMDkgMCAwLjAxOS0wLjAwMSAwLjAyOC0wLjAwMXYwLjAwMWgzMDMuOTQ1di0zMmgtMzAzLjk0NXoiPjwvcGF0aD4KPC9zdmc+Cg==',
      prerequisites: [
        t('You can optionally list prerequisites'),
        t('Another prerequisite'),
        t('These prerequisites are also displayed on the introduction step'),
      ],
      description: t('This description appears on the card in the quick starts catalog.'),
      introduction: t(
        '**This introduction is shown at the beginning of the quick start**\n- It introduces the quick start and lists the tasks within it.\n- You can view the [source for this quick start](https://github.com/patternfly/patternfly-quickstarts/blob/main/packages/dev/src/quickstarts-data/yaml/template.yaml) for additional help and information'
      ),
      tasks: [
        {
          title: t('Task 1 title'),
          description: t(
            '## Text\n\n1. The main body of the task. You can use markdown syntax here to create list items and more.\n\n  This is a paragraph.  \n  This is another paragraph. Add an empty line between paragraphs for line breaks or two spaces at the end.\n1. For more information on markdown syntax you can visit [this resource](https://www.markdownguide.org/basic-syntax/).\n1. A <small>limited set</small> of <strong>HTML tags</strong> [are also supported](https://docs.openshift.com/container-platform/4.9/web_console/creating-quick-start-tutorials.html#supported-tags-for-quick-starts_creating-quick-start-tutorials)\n\n## Images\n\nHTML img tag: <img alt="Ellipsis" src="images/fa-ellipsis-v.svg" style="height: 14px;">\n> Markdown would work as well but cannot add height/width style\n\nEllipsis icon (visible if font-awesome is installed): <i class="fas fa-ellipsis-v"></i>\n\nPF icon: <i class="pf-icon pf-icon-add-circle-o"></i>\n\n## Highlighting\n\nTo enable highlighting, the markdown syntax should contain:\n- Bracketed link text\n- The highlight keyword, followed by the ID of the element that you want to animate\n- The element to be highlighted, needs a `data-quickstart-id` attribute\n\n**Example**\n<pre>\n[Quick starts nav item]{{highlight quickstarts}}\n</pre>\nwill highlight an element with the `data-quickstart-id="quickstarts"` attribute\n\n### Code snippets\n\nThe syntax for an inline code snippet contains:\n- Text between back quotes, followed by `{{copy}}`\n\n#### Example 1\n\nThe following text demonstates an inline-copy element `https://github.com/sclorg/ruby-ex.git`{{copy}}\n\n#### Example 2\n\nAnd another one `https://patternfly.org`{{copy}} here!\n\nThe syntax for multi-line code snippets:\n- Text between triple back quotes, followed by `{{copy}}`\n\n#### Example 1\n\n```\noc new-app ruby~https://github.com/sclorg/ruby-ex.git\necho "Expose route using oc expose svc/ruby-ex"\noc expose svc/ruby-ex\n```{{copy}}\n\n#### Example 2\n\n```\nHello\nworld\n```{{copy}}  \n\n- Clicking the _Next_ button will display the **Check your work** module.\n\n### Admonition blocks\n\nThe syntax for rendering "Admonition Blocks" to Patternfly React Alerts:\n- Bracketed alert text contents\n- The admonition keyword, followed by the alert variant you want\n- Variants are: note, tip, important, caution, and warning\n\n**Examples**\n[This is the note contents with **some bold** text]{{admonition note}}\n[This is the tip contents]{{admonition tip}}\n[This is the important contents]{{admonition important}}\n[This is the caution contents]{{admonition caution}}\n[This is the warning contents]{{admonition warning}}'
          ),
          review: {
            instructions: t('- Did you complete the task successfully?'),
            failedTaskHelp: t("This task isn't verified yet. Try the task again."),
          },
          summary: {
            success: t('Shows a success message in the task header'),
            failed: t('Shows a failed message in the task header'),
          },
        },
        {
          title: t('Task 2 title'),
          description: t(
            "For more information, the folks at OpenShift wrote a nice guide here:\n[Creating quick starts](https://docs.openshift.com/container-platform/4.9/web_console/creating-quick-start-tutorials.html)\n\nAlso, don't forget to [check out the source](https://github.com/patternfly/patternfly-quickstarts/blob/main/packages/dev/src/quickstarts-data/yaml/template.yaml) for this quick start for more information!\n\nHappy writing!"
          ),
          review: {
            instructions: t('- Thanks for checking out this quick start!'),
            failedTaskHelp: t("This task isn't verified yet. Try the task again."),
          },
        },
      ],
      conclusion: t('The conclusion appears in the last section of the quick start.'),
      nextQuickStart: [t('mas-alert-note-prereq')],
    },
  };
  return exampleQuickStart;
}
