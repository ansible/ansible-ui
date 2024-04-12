import { useOutletContext } from "react-router-dom";
import { PageDetail, useGetPageUrl } from "../../../../../framework";
import { PageDetails } from "../../../../../framework";
import { NotificationTemplate } from "../../../interfaces/NotificationTemplate";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AwxRoute } from "../../../main/AwxRoutes";


export function NotificationDetails()
{
    const {t} = useTranslation();
    const {notificationTemplate} = useOutletContext<{notificationTemplate : NotificationTemplate}>();
    const getPageUrl = useGetPageUrl();
    return (
        <>
            <PageDetails>
                <PageDetail label={t('Name')}>{notificationTemplate.name}</PageDetail>
                <PageDetail label={t('Description')}>{notificationTemplate.description}</PageDetail>
                <PageDetail label={t('Organization')}><Link to={getPageUrl(AwxRoute.OrganizationDetails, { params : { id : notificationTemplate.summary_fields.organization.id}})}>{notificationTemplate.summary_fields.organization.name}</Link></PageDetail>
            </PageDetails>    
        </>
    );
}