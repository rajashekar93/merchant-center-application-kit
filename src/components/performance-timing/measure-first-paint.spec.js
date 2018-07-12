import React from 'react';
import { shallow } from 'enzyme';
import { reportErrorToSentry } from '@commercetools-frontend/sentry';
import { MeasureFirstPaint } from './measure-first-paint';

const createTestProps = custom => ({
  applicationLabel: 'application-foo',
  pushMetricSummary: jest.fn(() => Promise.resolve()),
  browserPerformanceApi: {
    getEntriesByType: jest.fn(() => [
      { name: 'firstPaint', startTime: 2028.5 },
      { name: 'firstContentfulPaint', startTime: 2028.5 },
    ]),
  },
  ...custom,
});

jest.mock('@commercetools-frontend/sentry');

describe('rendering', () => {
  let props;
  let wrapper;
  beforeEach(() => {
    props = createTestProps();
    wrapper = shallow(<MeasureFirstPaint {...props} />);
  });
  describe('when mounted', () => {
    beforeEach(() => {
      wrapper.instance().componentDidMount();
    });
    it('should send an action with the mapped metrics', () => {
      expect(props.pushMetricSummary).toHaveBeenCalledWith({
        body: [
          {
            metricLabels: { application: props.applicationLabel },
            metricName: 'browser_duration_first_paint_milliseconds',
            metricValue: 2028.5,
          },
          {
            metricLabels: { application: props.applicationLabel },
            metricName: 'browser_duration_first_contentful_paint_milliseconds',
            metricValue: 2028.5,
          },
        ],
      });
    });
    it('should not report error to sentry', () => {
      expect(reportErrorToSentry).not.toHaveBeenCalled();
    });
    describe('when request fails', () => {
      let error;
      beforeEach(() => {
        error = new Error('Oops');
        props = createTestProps({
          pushMetricSummary: jest.fn(() => Promise.reject(error)),
        });
        wrapper = shallow(<MeasureFirstPaint {...props} />);
        wrapper.instance().componentDidMount();
      });
      it('should not report error to sentry', () => {
        expect(reportErrorToSentry).toHaveBeenCalledWith(
          new Error('Unable to push first-paint metrics'),
          { extra: error }
        );
      });
    });
  });
});
