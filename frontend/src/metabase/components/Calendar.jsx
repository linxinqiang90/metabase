import React, { Component } from "react";
import PropTypes from "prop-types";
import DatePicker, { getDateTimeFieldTarget } from "../query_builder/components/filters/pickers/DatePicker";
import HoursMinutesInput from "../query_builder/components/filters/pickers/HoursMinutesInput";
import "./Calendar.css";
import cx from "classnames";
import moment from "moment";
import { t } from "c-3po";
import Icon from "metabase/components/Icon";
import SelectButton from "metabase/components/SelectButton";
import { option } from "metabase/components/Select";
import Select from "metabase/components/Select";
const DATE_FORMAT = "YYYY-MM-DD";
const DATE_TIME_FORMAT = "YYYY-MM-DDTHH:mm:ss";
export default class Calendar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      current: moment(props.initial || undefined),
      hours:0,
      minutes:0
    };
  }


  static propTypes = {
    selected: PropTypes.object,
    selectedEnd: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    isRangePicker: PropTypes.bool,
    isDual: PropTypes.bool,
  };

  static defaultProps = {
    isRangePicker: true,
  };

  componentWillReceiveProps(nextProps) {
    if (
      // `selected` became null or not null
      (nextProps.selected == null) !== (this.props.selected == null) ||
      // `selectedEnd` became null or not null
      (nextProps.selectedEnd == null) !== (this.props.selectedEnd == null) ||
      // `selected` is not null and doesn't match previous `selected`
      (nextProps.selected != null &&
        !moment(nextProps.selected).isSame(this.props.selected, "day")) ||
      // `selectedEnd` is not null and doesn't match previous `selectedEnd`
      (nextProps.selectedEnd != null &&
        !moment(nextProps.selectedEnd).isSame(this.props.selectedEnd, "day"))
    ) {
      let resetCurrent = false;
      if (nextProps.selected != null && nextProps.selectedEnd != null) {
        // reset if `current` isn't between `selected` and `selectedEnd` month
        resetCurrent =
          nextProps.selected.isAfter(this.state.current, "month") &&
          nextProps.selectedEnd.isBefore(this.state.current, "month");
      } else if (nextProps.selected != null) {
        // reset if `current` isn't in `selected` month
        resetCurrent =
          nextProps.selected.isAfter(this.state.current, "month") ||
          nextProps.selected.isBefore(this.state.current, "month");
      }
      if (resetCurrent) {
        this.setState({ current: nextProps.selected });
      }
    }
  }

  onClickDay = date => {
    let { selected, selectedEnd, isRangePicker } = this.props;
    if (!isRangePicker || !selected || selectedEnd) {
      this.props.onChange(date.hours(this.state.hours).minutes(this.state.minutes).format("YYYY-MM-DD HH:mm:ss"), null);
    } else if (!selectedEnd) {
      if (date.isAfter(selected)) {
        this.props.onChange(
          selected.format("YYYY-MM-DD"),
          date.hours(this.state.hours).minutes(this.state.minutes).format("YYYY-MM-DD HH:mm:ss"),
        );
      } else {
        this.props.onChange(
          date.hours(this.state.hours).minutes(this.state.minutes).format("YYYY-MM-DD HH:mm:ss"),
          selected.format("YYYY-MM-DD"),
        );
      }
    }
  };

  previous = () => {
    this.setState({ current: moment(this.state.current).add(-1, "M") });
  };

  next = () => {
    this.setState({ current: moment(this.state.current).add(1, "M") });
  };

  renderMonthHeader(current, side) {
    return (
      <div className="Calendar-header flex align-center">
        {side !== "right" && (
          <div
            className="bordered rounded p1 cursor-pointer transition-border border-hover px1"
            onClick={this.previous}
          >
            <Icon name="chevronleft" size={10}/>
          </div>
        )}
        <span className="flex-full"/>
        <h4 className="cursor-pointer rounded p1">
          {current.format("MMMM YYYY")}
        </h4>
        <span className="flex-full"/>
        {side !== "left" && (
          <div
            className="bordered border-hover rounded p1 transition-border cursor-pointer px1"
            onClick={this.next}
          >
            <Icon name="chevronright" size={10}/>
          </div>
        )}
      </div>
    );
  }

  renderDayNames() {
    const names = [t`Su`, t`Mo`, t`Tu`, t`We`, t`Th`, t`Fr`, t`Sa`];
    return (
      <div className="Calendar-day-names Calendar-week py1">
        {names.map(name => (
          <span key={name} className="Calendar-day-name text-centered">
            {name}
          </span>
        ))}
      </div>
    );
  }

  renderWeeks(current) {
    let weeks = [],
      done = false,
      date = moment(current)
        .startOf("month")
        .day("Sunday"),
      monthIndex = date.month(),
      count = 0;

    while (!done) {
      weeks.push(
        <Week
          key={date.toString()}
          date={moment(date)}
          month={current}
          onClickDay={this.onClickDay}
          selected={this.props.selected}
          selectedEnd={this.props.selectedEnd}
        />,
      );
      date.add(1, "w");
      done = count++ > 2 && monthIndex !== date.month();
      monthIndex = date.month();
    }

    return <div className="Calendar-weeks relative">{weeks}</div>;
  }

  setMinutes(value) {
    this.setState({minutes: value});
  }

  setHours(value) {
    this.setState({hours: value});
  }

  setChange(){
    this.props.onChange(this.state.current.hours(this.state.hours).minutes(this.state.minutes).format("YYYY-MM-DD HH:mm:ss"), null);
  }

  renderTime(value) {
    console.info(value);
    let hours = [],minutes=[];
    for(let i = 0;i<24;i++){
        hours.push(<option value={i} key={i}>Hours({i})</option>);
    }
    for(let i = 0;i<60;i++){
      minutes.push(<option value={i} key={i}>Minutes({i})</option>);
    }

    return (<div className="Calendar-header flex align-center" style={{paddingTop:"5px"}}>
      <select
        key="hours"
        value={this.state.hours}
        className="bg-white"
        style={{marginRight:"10px !important",width:"50%",height:"30px"}}
        onChange={e => this.setHours(e.target.value)}
        height={300}
      >
        {hours}
      </select>
      <select
        key="minutes"
        value={this.state.minutes}
        className="bg-white"
        style={{marginRight:"10px !important",width:"50%",height:"30px"}}
        onChange={e => this.setMinutes(e.target.value)}
        height={300}
      >
        {minutes}
      </select>
      <button key="ok" className="bg-white" onClick={e => this.setChange()} style={{height:"30px",paddingLeft:"10px",paddingRight:"10px",backgroundColor:"rgb(169, 169, 169)"}}>Ok</button>
    </div>);
  }

  renderCalender(current, side) {
    return (
      <div
        className={cx("Calendar Grid-cell", {
          "Calendar--range": this.props.selected && this.props.selectedEnd,
        })}
      >
        {this.renderMonthHeader(current, side)}
        {this.renderDayNames(current)}
        {this.renderWeeks(current)}
        {this.renderTime(current)}
      </div>
    );
  }

  render() {
    const { current } = this.state;
    if (this.props.isDual) {
      return (
        <div className="Grid Grid--1of2 Grid--gutters">
          {this.renderCalender(current, "left")}
          {this.renderCalender(moment(current).add(1, "month"), "right")}
        </div>
      );
    } else {
      return this.renderCalender(current);
    }
  }
}

class Week extends Component {
  static propTypes = {
    selected: PropTypes.object,
    selectedEnd: PropTypes.object,
    onClickDay: PropTypes.func.isRequired,
  };

  render() {
    let days = [];
    let { date, month, selected, selectedEnd } = this.props;

    for (let i = 0; i < 7; i++) {
      let classes = cx("Calendar-day p1 cursor-pointer text-centered", {
        "Calendar-day--today": date.isSame(new Date(), "day"),
        "Calendar-day--this-month": date.month() === month.month(),
        "Calendar-day--selected": selected && date.isSame(selected, "day"),
        "Calendar-day--selected-end":
          selectedEnd && date.isSame(selectedEnd, "day"),
        "Calendar-day--week-start": i === 0,
        "Calendar-day--week-end": i === 6,
        "Calendar-day--in-range":
          !(date.isSame(selected, "day") || date.isSame(selectedEnd, "day")) &&
          (date.isSame(selected, "day") ||
            date.isSame(selectedEnd, "day") ||
            (selectedEnd &&
              selectedEnd.isAfter(date, "day") &&
              date.isAfter(selected, "day"))),
      });
      days.push(
        <span
          key={date.toString()}
          className={classes}
          onClick={this.props.onClickDay.bind(null, date)}
        >
          {date.date()}
        </span>,
      );
      date = moment(date).add(1, "d");
    }

    return (
      <div className="Calendar-week" key={days[0].toString()}>
        {days}
      </div>
    );
  }
}
