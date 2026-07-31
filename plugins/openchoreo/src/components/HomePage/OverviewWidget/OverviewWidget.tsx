import { useCallback, useEffect, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { SummaryWidgetWrapper } from '@openchoreo/backstage-plugin-react';
import DashboardIcon from '@material-ui/icons/Dashboard';
import { CHOREO_ANNOTATIONS } from '@openchoreo/backstage-plugin-common';
import { openChoreoClientApiRef } from '../../../api/OpenChoreoClientApi';

interface OverviewCounts {
  projects: number;
  components: number;
  bindings: number;
  environments: number;
  apis: number;
  resources: number;
}

const EMPTY_COUNTS: OverviewCounts = {
  projects: 0,
  components: 0,
  bindings: 0,
  environments: 0,
  apis: 0,
  resources: 0,
};

/**
 * Home page widget summarizing the user's workspace: projects, components,
 * active deployments, environments, APIs and resources at a glance.
 */
export const OverviewWidget = () => {
  const [counts, setCounts] = useState<OverviewCounts>(EMPTY_COUNTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const catalogApi = useApi(catalogApiRef);
  const client = useApi(openChoreoClientApiRef);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        componentsResponse,
        systemsResponse,
        environmentsResponse,
        apisResponse,
        resourcesResponse,
      ] = await Promise.all([
        catalogApi.getEntities({ filter: { kind: 'Component' } }),
        catalogApi.getEntities({ filter: { kind: 'System' } }),
        catalogApi.getEntities({ filter: { kind: 'Environment' } }),
        catalogApi.getEntities({ filter: { kind: 'API' } }),
        catalogApi.getEntities({ filter: { kind: 'Resource' } }),
      ]);

      // Extract component info for fetching bindings
      const componentInfoList = componentsResponse.items
        .map(component => {
          const annotations = component.metadata.annotations || {};
          const namespaceName = annotations[CHOREO_ANNOTATIONS.NAMESPACE];
          const projectName = annotations[CHOREO_ANNOTATIONS.PROJECT];
          const componentName = annotations[CHOREO_ANNOTATIONS.COMPONENT];

          if (namespaceName && projectName && componentName) {
            return { namespaceName, projectName, componentName };
          }
          return null;
        })
        .filter(
          (
            info,
          ): info is {
            namespaceName: string;
            projectName: string;
            componentName: string;
          } => info !== null,
        );

      // Fetch total bindings count from backend
      const totalBindings =
        componentInfoList.length > 0
          ? await client.fetchTotalBindingsCount(componentInfoList)
          : 0;

      setCounts({
        projects: systemsResponse.items.length,
        components: componentsResponse.items.length,
        bindings: totalBindings,
        environments: environmentsResponse.items.length,
        apis: apisResponse.items.length,
        resources: resourcesResponse.items.length,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch overview data',
      );
      setCounts(EMPTY_COUNTS);
    } finally {
      setLoading(false);
    }
  }, [catalogApi, client]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <SummaryWidgetWrapper
      icon={<DashboardIcon fontSize="inherit" />}
      title="Overview"
      variant="cards"
      columns={3}
      metrics={[
        {
          label: 'Projects',
          value: counts.projects,
          link: '/catalog?filters[kind]=System',
        },
        {
          label: 'Components',
          value: counts.components,
          link: '/catalog?filters[kind]=Component',
        },
        { label: 'Active Deployments', value: counts.bindings },
        {
          label: 'Environments',
          value: counts.environments,
          link: '/catalog?filters[kind]=Environment',
        },
        { label: 'APIs', value: counts.apis, link: '/api-docs' },
        {
          label: 'Resources',
          value: counts.resources,
          link: '/catalog?filters[kind]=Resource',
        },
      ]}
      loading={loading}
      errorMessage={error || undefined}
    />
  );
};

/**
 * @deprecated Renamed — use {@link OverviewWidget}. Kept as an alias so
 * existing imports of the previously-exported name keep compiling.
 */
export const MyProjectsWidget = OverviewWidget;
