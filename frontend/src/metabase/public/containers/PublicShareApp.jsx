/* @flow */

import React, { Component } from "react";
import { connect } from "react-redux";

import PublicNotFound from "metabase/public/components/PublicNotFound";
import PublicError from "metabase/public/components/PublicError";
import PublicLinksListing from "metabase/admin/settings/components/widgets/PublicLinksListing";
import { CardApi, DashboardApi } from "metabase/services";
import { t } from "c-3po";
import * as Urls from "metabase/lib/urls";

type Props = {
  children: any,
  errorPage?: { status: number },
};

const mapStateToProps = (state, props) => ({
  errorPage: state.app.errorPage,
});

@connect(mapStateToProps)
export default class PublicShareApp extends Component {
  props: Props;

  render() {
    const { children, errorPage } = this.props;
    if (errorPage) {
      if (errorPage.status === 404) {
        return <PublicNotFound />;
      } else {
        return <PublicError />;
      }
    } else {
      return  <div>
        <fieldset style={{margin:"10px"}}>
          <legend>Public Dashboard Listing</legend>
        <PublicLinksListing
          load={DashboardApi.listPublic}
          type={t`Public Dashboard Listing`}
          getUrl={({ id }) => Urls.dashboard(id)}
          getPublicUrl={({ public_uuid }) => Urls.publicDashboard(public_uuid)}
          noLinksMessage={t`No dashboards have been publicly shared yet.`}
        />
        </fieldset>
        <fieldset style={{margin:"10px"}}>
          <legend>Public Card Listing</legend>
        <PublicLinksListing
        load={CardApi.listPublic}
        type={t`Public Card Listing`}
        getUrl={({ id }) => Urls.question(id)}
        getPublicUrl={({ public_uuid }) => Urls.publicQuestion(public_uuid)}
        noLinksMessage={t`No questions have been publicly shared yet.`}
        />
        </fieldset>
      </div>;
    }
  }
}
