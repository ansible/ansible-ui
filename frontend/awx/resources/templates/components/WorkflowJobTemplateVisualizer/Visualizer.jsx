/* eslint-disable i18next/no-literal-string */
/* eslint-disable react/prop-types */
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useCallback, useEffect, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { RouteObj } from '../../../../../common/Routes.js';
import { visualizerReducer } from '../WorkflowReducer.tsx';
import {
  WorkflowApprovalAPI,
  WorkflowJobTemplateNodesAPI,
  WorkflowJobTemplatesAPI,
} from './TemplatesAPI/index.jsx';
import { WorkflowDispatchContext, WorkflowStateContext } from './shared/WorkflowContext.jsx';
import { layoutGraph } from './utils/WorkflowUtils.jsx';
import { getAddedAndRemoved } from './utils/getAddedAndRemoved.jsx';
import { stringIsUUID } from './utils/strings.jsx';
import useRequest from './utils/useRequest.jsx';
// import { DeleteAllNodesModal, UnsavedChangesModal } from './Modals';
// import { LinkAddModal, LinkDeleteModal, LinkEditModal } from './Modals/LinkModals';
// import { NodeAddModal, NodeEditModal, NodeDeleteModal, NodeViewModal } from './Modals/NodeModals';
import VisualizerGraph from './VisualizerGraph.jsx';
import VisualizerStartScreen from './VisualizerStartScreen.jsx';
import VisualizerToolbar from './VisualizerToolbar.jsx';
``;

const Wrapper = styled.div`
  display: flex;
  flex-flow: column;
  height: 100%;
`;

const replaceIdentifier = (node) => {
  if (
    stringIsUUID(node.originalNodeObject.identifier) &&
    typeof node.identifier === 'string' &&
    node.identifier !== ''
  ) {
    return true;
  }

  if (
    !stringIsUUID(node.originalNodeObject.identifier) &&
    node.originalNodeObject.identifier !== node.identifier
  ) {
    return true;
  }

  return false;
};
const getAggregatedCredentials = (originalNodeOverride, templateDefaultCredentials) => {
  let theArray = [];

  const isCredentialOverriden = (templateDefaultCred) => {
    let credentialHasOverride = false;
    originalNodeOverride.forEach((overrideCred) => {
      if (overrideCred.credential_type === overrideCred.credential_type) {
        if (
          (!templateDefaultCred.vault_id && !overrideCred.inputs?.vault_id) ||
          (templateDefaultCred.vault_id &&
            overrideCred.inputs?.vault_id &&
            templateDefaultCred.vault_id === overrideCred.inputs?.vault_id)
        ) {
          credentialHasOverride = true;
        }
      }
    });

    return credentialHasOverride;
  };

  if (templateDefaultCredentials.length > 0) {
    templateDefaultCredentials.forEach((defaultCred) => {
      if (!isCredentialOverriden(defaultCred)) {
        theArray.push(defaultCred);
      }
    });
  }

  theArray = theArray.concat(originalNodeOverride);

  return theArray;
};

const fetchWorkflowNodes = async (templateId, pageNo = 1, workflowNodes = []) => {
  const { data } = await WorkflowJobTemplatesAPI.readNodes(templateId, {
    page_size: 200,
    page: pageNo,
  });
  if (data.next) {
    return fetchWorkflowNodes(templateId, pageNo + 1, workflowNodes.concat(data.results));
  }
  return workflowNodes.concat(data.results);
};

function Visualizer(props) {
  const { template } = props;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(visualizerReducer, {
    addLinkSourceNode: null,
    addLinkTargetNode: null,
    addNodeSource: null,
    addNodeTarget: null,
    addingLink: false,
    contentError: null,
    defaultOrganization: null,
    isLoading: true,
    linkToDelete: null,
    linkToEdit: null,
    links: [],
    nextNodeId: 0,
    nodePositions: null,
    nodeToDelete: null,
    nodeToEdit: null,
    nodeToView: null,
    nodes: [],
    showDeleteAllNodesModal: false,
    showLegend: false,
    showTools: false,
    showUnsavedChangesModal: false,
    unsavedChanges: false,
  });

  const { defaultOrganization, links, nodes, unsavedChanges, isLoading } = state;

  const handleVisualizerClose = () => {
    if (unsavedChanges) {
      dispatch({ type: 'TOGGLE_UNSAVED_CHANGES_MODAL' });
    } else {
      navigate(RouteObj.WorkflowJobTemplateDetails.replace(':id', template.id.toString()));
    }
  };

  const associateNodes = (newLinks, originalLinkMap) => {
    const associateNodeRequests = [];
    newLinks.forEach((link) => {
      switch (link.linkType) {
        case 'success':
          associateNodeRequests.push(
            WorkflowJobTemplateNodesAPI.associateSuccessNode(
              originalLinkMap[link.source.id].id,
              originalLinkMap[link.target.id].id
            )
          );
          break;
        case 'failure':
          associateNodeRequests.push(
            WorkflowJobTemplateNodesAPI.associateFailureNode(
              originalLinkMap[link.source.id].id,
              originalLinkMap[link.target.id].id
            )
          );
          break;
        case 'always':
          associateNodeRequests.push(
            WorkflowJobTemplateNodesAPI.associateAlwaysNode(
              originalLinkMap[link.source.id].id,
              originalLinkMap[link.target.id].id
            )
          );
          break;
        default:
      }
    });

    return associateNodeRequests;
  };

  const disassociateNodes = (originalLinkMap, deletedNodeIds, linkMap) => {
    const disassociateNodeRequests = [];
    Object.keys(originalLinkMap).forEach((key) => {
      const node = originalLinkMap[key];
      node.success_nodes.forEach((successNodeId) => {
        if (
          !deletedNodeIds.includes(successNodeId) &&
          (!linkMap[node.id] ||
            !linkMap[node.id][successNodeId] ||
            linkMap[node.id][successNodeId] !== 'success')
        ) {
          disassociateNodeRequests.push(
            WorkflowJobTemplateNodesAPI.disassociateSuccessNode(node.id, successNodeId)
          );
        }
      });
      node.failure_nodes.forEach((failureNodeId) => {
        if (
          !deletedNodeIds.includes(failureNodeId) &&
          (!linkMap[node.id] ||
            !linkMap[node.id][failureNodeId] ||
            linkMap[node.id][failureNodeId] !== 'failure')
        ) {
          disassociateNodeRequests.push(
            WorkflowJobTemplateNodesAPI.disassociateFailuresNode(node.id, failureNodeId)
          );
        }
      });
      node.always_nodes.forEach((alwaysNodeId) => {
        if (
          !deletedNodeIds.includes(alwaysNodeId) &&
          (!linkMap[node.id] ||
            !linkMap[node.id][alwaysNodeId] ||
            linkMap[node.id][alwaysNodeId] !== 'always')
        ) {
          disassociateNodeRequests.push(
            WorkflowJobTemplateNodesAPI.disassociateAlwaysNode(node.id, alwaysNodeId)
          );
        }
      });
    });

    return disassociateNodeRequests;
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const workflowNodes = await fetchWorkflowNodes(template.id);
        dispatch({
          type: 'GENERATE_NODES_AND_LINKS',
          nodes: workflowNodes,
          translation: t,
        });
      } catch (error) {
        dispatch({ type: 'SET_CONTENT_ERROR', value: error });
      } finally {
        dispatch({ type: 'SET_IS_LOADING', value: false });
      }
    }
    fetchData();
  }, [template.id, t]);

  // Update positions of nodes/links
  useEffect(() => {
    if (nodes.length) {
      const newNodePositions = {};
      const nonDeletedNodes = nodes.filter((node) => !node.isDeleted);
      const g = layoutGraph(nonDeletedNodes, links);

      g.nodes().forEach((node) => {
        newNodePositions[node] = g.node(node);
      });

      dispatch({ type: 'SET_NODE_POSITIONS', value: newNodePositions });
    }
  }, [links, nodes]);

  const { request: saveVisualizer } = useRequest(
    useCallback(async () => {
      const nodeRequests = [];
      const approvalTemplateRequests = [];
      const originalLinkMap = {};
      const deletedNodeIds = [];
      const associateCredentialRequests = [];
      const disassociateCredentialRequests = [];
      const associateLabelRequests = [];
      const disassociateLabelRequests = [];
      const instanceGroupRequests = [];

      const generateLinkMapAndNewLinks = () => {
        const linkMap = {};
        const newLinks = [];

        links.forEach((link) => {
          if (link.source.id !== 1) {
            const realLinkSourceId = originalLinkMap[link.source.id].id;
            const realLinkTargetId = originalLinkMap[link.target.id].id;
            if (!linkMap[realLinkSourceId]) {
              linkMap[realLinkSourceId] = {};
            }
            linkMap[realLinkSourceId][realLinkTargetId] = link.linkType;
            switch (link.linkType) {
              case 'success':
                if (
                  !originalLinkMap[link.source.id].success_nodes.includes(
                    originalLinkMap[link.target.id].id
                  )
                ) {
                  newLinks.push(link);
                }
                break;
              case 'failure':
                if (
                  !originalLinkMap[link.source.id].failure_nodes.includes(
                    originalLinkMap[link.target.id].id
                  )
                ) {
                  newLinks.push(link);
                }
                break;
              case 'always':
                if (
                  !originalLinkMap[link.source.id].always_nodes.includes(
                    originalLinkMap[link.target.id].id
                  )
                ) {
                  newLinks.push(link);
                }
                break;
              default:
            }
          }
        });

        return [linkMap, newLinks];
      };

      nodes.forEach((node) => {
        // node with id=1 is the artificial start node
        if (node.id === 1) {
          return;
        }
        if (node.originalNodeObject && !node.isDeleted) {
          const { id, success_nodes, failure_nodes, always_nodes } = node.originalNodeObject;
          originalLinkMap[node.id] = {
            id,
            success_nodes,
            failure_nodes,
            always_nodes,
          };
        }
        if (node.isDeleted && node.originalNodeObject) {
          deletedNodeIds.push(node.originalNodeObject.id);
          nodeRequests.push(WorkflowJobTemplateNodesAPI.destroy(node.originalNodeObject.id));
        } else if (!node.isDeleted && !node.originalNodeObject) {
          if (node.fullUnifiedJobTemplate.type === 'workflow_approval_template') {
            nodeRequests.push(
              WorkflowJobTemplatesAPI.createNode(template.id, {
                all_parents_must_converge: node.all_parents_must_converge,
                ...(node.identifier && { identifier: node.identifier }),
              }).then(({ data }) => {
                node.originalNodeObject = data;
                originalLinkMap[node.id] = {
                  id: data.id,
                  success_nodes: [],
                  failure_nodes: [],
                  always_nodes: [],
                };
                approvalTemplateRequests.push(
                  WorkflowJobTemplateNodesAPI.createApprovalTemplate(data.id, {
                    name: node.fullUnifiedJobTemplate.name,
                    description: node.fullUnifiedJobTemplate.description,
                    timeout: node.fullUnifiedJobTemplate.timeout,
                  })
                );
              })
            );
          } else {
            nodeRequests.push(
              WorkflowJobTemplatesAPI.createNode(template.id, {
                ...node.promptValues,
                execution_environment: node.promptValues?.execution_environment?.id || null,
                inventory: node.promptValues?.inventory?.id || null,
                unified_job_template: node.fullUnifiedJobTemplate.id,
                all_parents_must_converge: node.all_parents_must_converge,
                ...(node.identifier && { identifier: node.identifier }),
              }).then(({ data }) => {
                node.originalNodeObject = data;
                originalLinkMap[node.id] = {
                  id: data.id,
                  success_nodes: [],
                  failure_nodes: [],
                  always_nodes: [],
                };

                if (node.promptValues?.addedCredentials?.length > 0) {
                  node.promptValues.addedCredentials.forEach((cred) => {
                    associateCredentialRequests.push(
                      WorkflowJobTemplateNodesAPI.associateCredentials(data.id, cred.id)
                    );
                  });
                }

                if (node.promptValues?.labels?.length > 0) {
                  node.promptValues.labels.forEach((label) => {
                    associateLabelRequests.push(
                      WorkflowJobTemplateNodesAPI.associateLabel(
                        data.id,
                        label,
                        node.fullUnifiedJobTemplate.organization || defaultOrganization
                      )
                    );
                  });
                }
                if (node.promptValues?.instance_groups?.length > 0)
                  /* eslint-disable no-await-in-loop, no-restricted-syntax */
                  for (const group of node.promptValues.instance_groups) {
                    instanceGroupRequests.push(
                      WorkflowJobTemplateNodesAPI.associateInstanceGroup(data.id, group.id)
                    );
                  }
              })
            );
          }
        } else if (node.isEdited) {
          if (node.fullUnifiedJobTemplate.type === 'workflow_approval_template') {
            if (
              node.originalNodeObject.summary_fields.unified_job_template?.unified_job_type ===
              'workflow_approval'
            ) {
              nodeRequests.push(
                WorkflowJobTemplateNodesAPI.replace(node.originalNodeObject.id, {
                  all_parents_must_converge: node.all_parents_must_converge,
                  ...(replaceIdentifier(node) && {
                    identifier: node.identifier,
                  }),
                }).then(({ data }) => {
                  node.originalNodeObject = data;
                  approvalTemplateRequests.push(
                    WorkflowApprovalAPI.update(
                      node.originalNodeObject.summary_fields.unified_job_template.id,
                      {
                        name: node.fullUnifiedJobTemplate.name,
                        description: node.fullUnifiedJobTemplate.description,
                        timeout: node.fullUnifiedJobTemplate.timeout,
                      }
                    )
                  );
                })
              );
            } else {
              nodeRequests.push(
                WorkflowJobTemplateNodesAPI.replace(node.originalNodeObject.id, {
                  all_parents_must_converge: node.all_parents_must_converge,
                  ...(replaceIdentifier(node) && {
                    identifier: node.identifier,
                  }),
                }).then(({ data }) => {
                  node.originalNodeObject = data;
                  approvalTemplateRequests.push(
                    WorkflowJobTemplateNodesAPI.createApprovalTemplate(node.originalNodeObject.id, {
                      name: node.fullUnifiedJobTemplate.name,
                      description: node.fullUnifiedJobTemplate.description,
                      timeout: node.fullUnifiedJobTemplate.timeout,
                    })
                  );
                })
              );
            }
          } else {
            nodeRequests.push(
              WorkflowJobTemplateNodesAPI.replace(node.originalNodeObject.id, {
                ...node.promptValues,
                execution_environment: node.promptValues?.execution_environment?.id || null,
                inventory: node.promptValues?.inventory?.id || null,
                unified_job_template: node.fullUnifiedJobTemplate.id,
                all_parents_must_converge: node.all_parents_must_converge,
                ...(replaceIdentifier(node) && {
                  identifier: node.identifier,
                }),
              }).then(() => {
                const { added: addedCredentials, removed: removedCredentials } = getAddedAndRemoved(
                  getAggregatedCredentials(
                    node?.originalNodeCredentials,
                    node.launchConfig?.defaults?.credentials
                  ),
                  node.promptValues?.credentials
                );

                const { added: addedLabels, removed: removedLabels } = getAddedAndRemoved(
                  node?.originalNodeLabels,
                  node.promptValues?.labels
                );

                if (addedCredentials.length > 0) {
                  addedCredentials.forEach((cred) => {
                    associateCredentialRequests.push(
                      WorkflowJobTemplateNodesAPI.associateCredentials(
                        node.originalNodeObject.id,
                        cred.id
                      )
                    );
                  });
                }
                if (removedCredentials?.length > 0) {
                  removedCredentials.forEach((cred) =>
                    disassociateCredentialRequests.push(
                      WorkflowJobTemplateNodesAPI.disassociateCredentials(
                        node.originalNodeObject.id,
                        cred.id
                      )
                    )
                  );
                }

                if (addedLabels.length > 0) {
                  addedLabels.forEach((label) => {
                    associateLabelRequests.push(
                      WorkflowJobTemplateNodesAPI.associateLabel(
                        node.originalNodeObject.id,
                        label,
                        node.fullUnifiedJobTemplate.organization || defaultOrganization
                      )
                    );
                  });
                }
                if (removedLabels?.length > 0) {
                  removedLabels.forEach((label) =>
                    disassociateLabelRequests.push(
                      WorkflowJobTemplateNodesAPI.disassociateLabel(
                        node.originalNodeObject.id,
                        label,
                        node.fullUnifiedJobTemplate.organization || defaultOrganization
                      )
                    )
                  );
                }

                if (node.promptValues?.instance_groups) {
                  instanceGroupRequests.push(
                    WorkflowJobTemplateNodesAPI.orderInstanceGroups(
                      node.originalNodeObject.id,
                      node.promptValues?.instance_groups,
                      node?.originalNodeInstanceGroups || []
                    )
                  );
                }
              })
            );
          }
        }
      });

      await Promise.all(nodeRequests);
      // Creating approval templates needs to happen after the node has been created
      // since we reference the node in the approval template request.
      await Promise.all(approvalTemplateRequests);
      const [linkMap, newLinks] = generateLinkMapAndNewLinks(originalLinkMap);
      await Promise.all(disassociateNodes(originalLinkMap, deletedNodeIds, linkMap));
      await Promise.all(associateNodes(newLinks, originalLinkMap));

      await Promise.all([...disassociateCredentialRequests, ...disassociateLabelRequests]);
      await Promise.all([
        ...associateCredentialRequests,
        ...associateLabelRequests,
        ...instanceGroupRequests,
      ]);
      navigate(RouteObj.WorkflowJobTemplateDetails.replace(':id', template.id.toString()));
    }, [links, nodes, navigate, defaultOrganization, template.id]),
    {}
  );

  const readOnly = !template?.summary_fields?.user_capabilities?.edit;
  if (isLoading) {
    return <div>is loading</div>;
  }
  return (
    <WorkflowStateContext.Provider value={state}>
      <WorkflowDispatchContext.Provider value={dispatch}>
        <Wrapper>
          <VisualizerToolbar
            onClose={handleVisualizerClose}
            onSave={() => saveVisualizer(nodes)}
            hasUnsavedChanges={unsavedChanges}
            template={template}
            readOnly={readOnly}
          />
          {links.length > 0 ? (
            <VisualizerGraph readOnly={readOnly} />
          ) : (
            <VisualizerStartScreen readOnly={readOnly} />
          )}
        </Wrapper>
      </WorkflowDispatchContext.Provider>
    </WorkflowStateContext.Provider>
  );
}

export default Visualizer;
