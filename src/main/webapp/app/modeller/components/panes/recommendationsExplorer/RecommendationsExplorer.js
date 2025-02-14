import React from "react";
import PropTypes from 'prop-types';
import {Panel, Button, OverlayTrigger, Tooltip} from "react-bootstrap";
import {connect} from "react-redux";
import {JsonView, defaultStyles} from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import Explorer from "../common/Explorer";
import ControlStrategiesPanel from "../details/accordion/panels/ControlStrategiesPanel";
import * as Constants from "../../../../common/constants.js";
import {renderControlSet} from "../csgExplorer/ControlStrategyRenderer";
import {
    updateControlOnAsset,
    updateControls,
} from "../../../../modeller/actions/ModellerActions";

class RecommendationsExplorer extends React.Component {

    constructor(props) {
        super(props);

        this.renderContent = this.renderContent.bind(this);
        this.renderJson = this.renderJson.bind(this);
        this.renderRecommendations = this.renderRecommendations.bind(this);
        this.renderNoRecommendations = this.renderNoRecommendations.bind(this);
        this.renderControlSets = this.renderControlSets.bind(this);
        this.getControlSets = this.getControlSets.bind(this);
        this.getRiskVector = this.getRiskVector.bind(this);
        this.getHighestRiskLevel = this.getHighestRiskLevel.bind(this);
        this.getAssetByUri = this.getAssetByUri.bind(this);
        this.getRiskVectorString = this.getRiskVectorString.bind(this);
        this.compareRiskVectors = this.compareRiskVectors.bind(this);
        this.updateThreat = this.updateThreat.bind(this);
        this.applyRecommendation = this.applyRecommendation.bind(this);

        this.state = {
            updatingControlSets: {}
        }

    }

    componentWillReceiveProps(nextProps) {
        this.setState({...this.state,
            updatingControlSets: {}
        });
    }

    render() {
        if (!this.props.show) {
            return null;
        }

        return (
            <Explorer
                title={"Recommendations Explorer (work in progress)"}
                windowName={"recommendationsExplorer"}
                documentationLink={"redirect/recommendations-explorer"}
                rndParams={{xScale: 0.20, width: 700, height: 600}}
                selectedAsset={this.props.selectedAsset}
                isActive={this.props.isActive}
                show={this.props.show}
                onHide={this.props.onHide}
                loading={this.props.loading}
                dispatch={this.props.dispatch}
                renderContent={this.renderContent}
                windowOrder={this.props.windowOrder}
            />
        )
    }

    renderContent() {
        let renderRecommentations = true; 
        let recommendations = this.props.recommendations;

        if (renderRecommentations) {
            return this.renderRecommendations(recommendations);
        }
        else {
            return this.renderJson(recommendations);
        }
    }

    renderJson(recommendations) {
        return (
            <div className="content">
                {recommendations && <JsonView data={recommendations} shouldExpandNode={shouldExpandRecommendationsNode} style={defaultStyles} />}
            </div>
        )
    }

    renderRecommendations(report) {
        if (jQuery.isEmptyObject(report)) {
            return null;
        }

        let max_recommendations = Constants.MAX_RECOMMENDATIONS; //max number to display
        let recommendations = report.recommendations || [];
        let selected_recommendations = [];

        recommendations.forEach(rec => {
            rec.state.riskVector = this.getRiskVector(rec.state.risk);
        });

        recommendations.sort((a, b) => this.compareRiskVectors(a.state.riskVector, b.state.riskVector)); //sort by ascending risk vector

        //Select recommendations from the top of the list, up to the max number
        selected_recommendations = recommendations.slice(0, max_recommendations);

        let csgAssets = this.props.csgAssets;

        return (
            <div className="content">
                <div className="desc">
                    <p>N.B. The recommendations feature is a work in progress 
                        and will not always give the most sensible recommendation(s). 
                        It may also take a very long time to run, in particular for Future risk recommendations. 
                        A list of known issues can be found on <a href="https://github.com/Spyderisk/system-modeller/issues/140" target="_blank">GitHub</a>.</p>
                    {recommendations.length > 0 && <p>Returned {recommendations.length} recommendations 
                    {recommendations.length > max_recommendations ? " (Displaying top " + max_recommendations + ")" : ""}</p>}
                </div>
                {!recommendations.length ? this.renderNoRecommendations() : 
                <div className="panel-group accordion recommendations">
                    {selected_recommendations.map((rec, index) => {
                        let id = rec.identifier;
                        let reccsgs = rec.controlStrategies;
                        let riskVectorString = this.getRiskVectorString(rec.state.riskVector);
                        let riskLevel = this.getHighestRiskLevel(rec.state.riskVector);
                        let csgsByName = new Map();

                        reccsgs.forEach((reccsg) => {
                            let csguri = Constants.URI_PREFIX + reccsg.uri;
                            let csg = this.props.model.controlStrategies[csguri];
                            let name = csg.label;
                            let assetUri = csgAssets[csguri];
                            let asset = assetUri ? this.getAssetByUri(assetUri) : {label: "Unknown"}
                            csg.asset = asset;
                            csgsByName.set(name, csg);
                        });

                        csgsByName = new Map([...csgsByName.entries()].sort((a, b) => a[0].localeCompare(b[0])));
                        let csgsArray = Array.from(csgsByName);
                        let applyButtonTooltipText = "Enable all recommended controls";

                        return (
                            <Panel key={id} bsStyle="primary" defaultExpanded>
                                <Panel.Heading>
                                    <Panel.Title toggle>
                                        <span>Recommendation {index + 1}</span>
                                    </Panel.Title>
                                </Panel.Heading>
                                <Panel.Collapse>
                                    <Panel.Body>
                                        <p>Residual risk: {riskLevel.label} ({riskVectorString})</p>
                                        <p>Control Strategies to enable</p>
                                        <ControlStrategiesPanel dispatch={this.props.dispatch}
                                            modelId={this.props.model["id"]}
                                            assetCsgs={csgsArray}
                                            displayAssetName={true}
                                            authz={this.props.authz}
                                        />
                                        <p style={{marginTop: "10px"}}>Controls to enable</p>
                                        {this.renderControlSets(rec.controls)}
                                        <p style={{marginTop: "5px", marginBottom: "0px"}}>
                                            <OverlayTrigger delayShow={Constants.TOOLTIP_DELAY} placement="right"
                                                overlay={<Tooltip id={"risklevel-tooltip-" + id} className={"tooltip-overlay"}>
                                                    <strong>{applyButtonTooltipText}</strong></Tooltip>}>
                                                <Button disabled={!this.props.authz.userEdit} bsClass="btn btn-primary btn-xs"
                                                    onClick={() => {this.applyRecommendation(id)}}>Apply</Button>
                                            </OverlayTrigger>
                                        </p>
                                    </Panel.Body>
                                </Panel.Collapse>
                            </Panel>
                        );
                    })}
                </div>}
            </div>
        )
    }

    renderNoRecommendations() {
        return (
            <div className="desc">
                <p>There are no current recommendations for reducing the system model risk any further.</p>
            </div>
        );
    }

    renderControlSets(controls) {
        let controlSets = this.getControlSets(controls);
        controlSets.sort((a, b) => a["label"].localeCompare(b["label"]));

        return (
            <div>
                {controlSets.map((control, index) => {
                    control.optional = false; //assume recommendation does not suggest optional controls
                    let asset = control["assetUri"] ? this.getAssetByUri(control["assetUri"]) : {label: "Unknown"}
                    let assetName = asset.label;
                    return renderControlSet(control, index, null, true, assetName, this.props, this.state, this);
                })}
            </div>
        );
    }

    getControlSets(controls) {
        let modelControlSets = this.props.controlSets;
        let controlSets = controls.map(control => {
            let csuri = Constants.URI_PREFIX + control.uri;
            let cs = modelControlSets[csuri];
            return cs;
        });

        return controlSets;
    }

    getRiskVector(reportedRisk) {
        let shortUris = Object.keys(reportedRisk);
        let riskLevels = this.props.model.levels["RiskLevel"];

        let riskLevelsMap = {}
        riskLevels.forEach(level => {
            let levelUri = level.uri;
            riskLevelsMap[levelUri] = level;
        });
        
        let riskVector = shortUris.map(shorturi => {
            let uri = Constants.URI_PREFIX + shorturi;
            let riskLevel = riskLevelsMap[uri];
            let riskLevelCount = {level: riskLevel, count: reportedRisk[shorturi]}
            return riskLevelCount;
        });

        //Finally sort the risk vector by level value
        riskVector.sort((a, b) => {
            if (a.level.value < b.level.value) {
                return -1;
            }
            else if (a.level.value > b.level.value) {
                return 1;
            }
            else {
                return 0;
            }
        });

        return riskVector;
    }

    //e.g. "Very Low: 695, Low: 0, Medium: 1, High: 0, Very High: 0"
    getRiskVectorString(riskVector) {
        let strArr = riskVector.map(riskLevelCount => {
            let level = riskLevelCount.level;
            return [level.label, riskLevelCount.count].join(": ");
        });

        return strArr.join(", ");
    }

    //Compare risk vectors (assumes arrays are pre-sorted)
    compareRiskVectors(rva, rvb) {
        let compare = 0;
        for (let i = rva.length -1; i >= 0; i--) {
            compare = rva[i].count - rvb[i].count;
            if (compare !== 0) {
                return compare;
            }
        }
        return compare;
    }

    //Get highest risk level from given risk vector
    //i.e. which is the highest risk level that has >0 misbehaviours
    //TODO: could this be moved to a utility function?
    getHighestRiskLevel(riskVector) {
        let overall = 0;
        let hishestLevel = null;
        riskVector.forEach(riskLevelCount => {
            let level = riskLevelCount.level;
            let count = riskLevelCount.count;
            if (count > 0 && level.value >= overall) {
                overall = level.value;
                hishestLevel = level;
            }
        });

        return hishestLevel;
    }

    //TODO: this should be a utility function on the model
    getAssetByUri(assetUri) {
        let asset = this.props.model.assets.find((asset) => {
            return (asset.uri === assetUri);
        });
        return asset;
    }

    updateThreat(arg) {
        //this is to enable a single control in a control strategy
        if (arg.hasOwnProperty("control")) {
            //Here we still want to keep the currently selected asset, not change to the asset referred to in the updatedControl
            this.props.dispatch(updateControlOnAsset(this.props.model.id, arg.control.assetId, arg.control));
        }
    }

    applyRecommendation(recid) {
        let proposed = true;
        let report = this.props.recommendations; //get recommendations report
        let rec = report.recommendations.find((rec) => rec["identifier"] === recid);

        if (rec) {
            let controlsToUpdate = rec.controls.map(control => {
                return Constants.URI_PREFIX + control.uri;
            });

            let updatingControlSets = {...this.state.updatingControlSets};
            controlsToUpdate.forEach(controlUri => {
                updatingControlSets[controlUri] = true;
            });
        
            this.setState({
                updatingControlSets: updatingControlSets,
            });

            this.props.dispatch(updateControls(this.props.model.id, controlsToUpdate, proposed, proposed)); //set WIP flag only if proposed is true
        }
        else {
            console.warn("Could not locate recommendation: ", recid);
        }
    }

}

function shouldExpandRecommendationsNode(level) {
    return level <= 1;
}

RecommendationsExplorer.propTypes = {
    model: PropTypes.object,
    controlSets: PropTypes.object,
    csgAssets: PropTypes.object,
    selectedAsset: PropTypes.object,
    isActive: PropTypes.bool, // is in front of other panels
    recommendations: PropTypes.object,
    show: PropTypes.bool,
    onHide: PropTypes.func,
    loading: PropTypes.object,
    dispatch: PropTypes.func,
    windowOrder: PropTypes.number,
    authz: PropTypes.object,
};

let mapStateToProps = function (state) {
    return {
        windowOrder: state.view["recommendationsExplorer"]
    }
};

export default connect(mapStateToProps)(RecommendationsExplorer);
