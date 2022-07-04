import React, { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
import styled from 'styled-components';
import { generate as uuid } from 'shortid';

import DataTable from '@components/layouts/DataTable';
import Icon from '@components/layouts/Icon';


//* Custom Hooks
const useOrderData = (() => {
  const getInitial = () => ({
    seq: null, //* 紀錄當前資料 Seq
    connect: uuid(), //* 判斷是否要重新連接
    last: null,
    sell: [],
    buy: []
  });

  const transform = (quotes) => (
    quotes.map((quote) => {
      const [price, size] = quote.map((str) => Number(str));

      return { price, size };
    })
  );

  const update = (type, quotes, previous) => (
    quotes.reduce(
      (result, { price, size }) => {
        const { price: limit } = result[result.length - 1] || {};

        if ((type === 'sell' && price <= limit) || (type === 'buy' && price >= limit)) {
          if (!size) {
            const index = result.findIndex((quote) => price === quote.price);

            index >= 0 && result.splice(index, 1);
          } else {
            const index = result.findIndex((quote) => ((type === 'sell' && price <= quote.price) || (type === 'buy' && price >= quote.price)));
            const quote = result[index];
            const equal = quote.price === price;

            result.splice(index < 0 ? 0 : index, index < 0 || !equal ? 0 : 1, {
              price,
              size,

              ...(!equal && {
                status: 'new'
              }),
              ...(equal && quote.size !== size && {
                status: quote.size > size ? 'minus' : 'add'
              })
            });
          }
        }

        return result.slice(0, __WEBPACK_DEFINE__.MAX_QUOTE_ROWS);
      },
      previous.map(({ status: _s, ...quote }) => quote)
    )
  );

  function reducer(state, { type, data }) {
    switch (type) {
      case 'snapshot': {
        const { asks, bids } = data;

        return {
          ...state,
          seq: data.seqNum,
          sell: transform(asks).reverse(),
          buy: transform(bids)
        };
      }
      case 'delta': {
        const { seq, sell, buy } = state;
        const newSell = update('sell', transform(data.asks), sell);
        const newBuy = update('buy', transform(data.bids), buy);

        return (seq !== data.prevSeqNum || newSell.length < __WEBPACK_DEFINE__.DISPLAY_QUOTE_ROWS || newBuy.length < __WEBPACK_DEFINE__.DISPLAY_QUOTE_ROWS)
          ? getInitial()
          : {
            ...state,
            seq: data.seqNum,
            sell: newSell,
            buy: newBuy
          };
      }
      case 'price': {
        const { last } = state;
        const [current, ...previous] = data;

        if (JSON.stringify(last?.price) !== JSON.stringify(current.price)) {
          const prev = last?.price || previous.find(({ price }) => price !== current.price).price;

          return {
            ...state,
            last: {
              price: current.price,
              status: prev > current.price ? 'minus' : 'add'
            }
          };
        }

        break;
      }
      default:
    }

    return state;
  }

  return () => {
    const [{ connect, sell, buy, last }, dispatch] = useReducer(reducer, getInitial());

    //* Sell/Buy Data Listener
    useEffect(() => {
      const socket = new WebSocket('wss://ws.btse.com/ws/oss/futures');

      socket.onopen = () => socket.send(JSON.stringify({ op: 'subscribe', args: ['update:BTCPFC'] }));

      socket.onmessage = ({ data }) => {
        const result = JSON.parse(data);

        if (result.topic === 'update:BTCPFC') {
          dispatch({ type: result.data.type, data: result.data });
        }
      };

      return () => socket.close();
    }, [connect]);

    //* Last Price Listener
    useEffect(() => {
      const socket = new WebSocket('wss://ws.btse.com/ws/futures');

      socket.onopen = () => socket.send(JSON.stringify({ op: 'subscribe', args: ['tradeHistoryApi:BTCPFC'] }));

      socket.onmessage = ({ data }) => {
        const result = JSON.parse(data);

        if (result.topic === 'tradeHistoryApi') {
          dispatch({ type: 'price', data: result.data });
        }
      };

      return () => socket.close();
    }, [connect]);

    return {
      sell: sell.slice(0, __WEBPACK_DEFINE__.DISPLAY_QUOTE_ROWS),
      buy: buy.slice(0, __WEBPACK_DEFINE__.DISPLAY_QUOTE_ROWS),
      last
    };
  };
})();


//* Component
const FixedRow = styled(DataTable.Row)`
  & > td:not([colspan]), & > th:not([colspan]) {
    &:first-child {
      width: 40%;
      text-align: left;
    }

    &:nth-child(2) {
      width: 20%;
      text-align: right;
    }

    &:last-child {
      width: 40%;
      text-align: right;
    }
  }
`;

const Accumulative = styled(({ className, status, price }) => (
  <DataTable.Title className={className} align="center">
    {numeral(price).format('0,0.0')}

    {status === 'add'
      ? (<Icon.ArrowUp fontSize={18} />)
      : (<Icon.ArrowDown fontSize={18} />)}
  </DataTable.Title>
))`
  ${({theme, status}) => `
    background: ${theme[`${status}StateBackground`]};
    color: ${theme[`${status}TextColor`]} !important;
    font-size: 16px;

    & > *[role=icon] {
      fill: ${theme[`${status}TextColor`]} !important;
      margin-left: 8px;
    }
  `}
`;

export default function QuoteDataTable({ className, title }) {
  const { sell, buy, last } = useOrderData();

  return (
    <DataTable.Container className={className}>
      {title && (
        <DataTable.Title fontWeight={500} padding="8px 0 16px 0">
          {title}
        </DataTable.Title>
      )}

      <DataTable.Header>
        <FixedRow>
          <DataTable.Label>
            Price (USD)
          </DataTable.Label>

          <DataTable.Label>
            Size
          </DataTable.Label>

          <DataTable.Label>
            Total
          </DataTable.Label>
        </FixedRow>
      </DataTable.Header>

      <DataTable.Body reverse>
        {sell.reduce(
          ({ rows, sum }, { price, size, status }, i) => {
            const $sum = sum + size;

            return {
              sum: $sum,
              rows: rows.concat(
                <FixedRow key={`sell-${i}`} background={status === 'new' && 'minusHighlightBackground'}>
                  <DataTable.Cell color="minusTextColor">
                    {numeral(price).format('0,0.0')}
                  </DataTable.Cell>

                  <DataTable.Cell {...(status && status !== 'new' && { background: status === 'add' ? 'addStatusBackground' : 'minusStatusBackground' })}>
                    {numeral(size).format('0,0')}
                  </DataTable.Cell>

                  <DataTable.Cell>
                    {numeral($sum).format('0,0')}
                  </DataTable.Cell>
                </FixedRow>
              )
            };
          },
          { rows: [], sum: 0 }
        ).rows}
      </DataTable.Body>

      {last && (
        <Accumulative {...last} />
      )}

      <DataTable.Body>
        {buy.reduce(
          ({ rows, sum }, { price, size, status }, i) => {
            const $sum = sum + size;

            return {
              sum: $sum,
              rows: rows.concat(
                <FixedRow key={`sell-${i}`} background={status === 'new' && 'addHighlightBackground'}>
                  <DataTable.Cell color="addTextColor">
                    {numeral(price).format('0,0.0')}
                  </DataTable.Cell>

                  <DataTable.Cell {...(status && status !== 'new' && { background: status === 'add' ? 'addStatusBackground' : 'minusStatusBackground' })}>
                    {numeral(size).format('0,0')}
                  </DataTable.Cell>

                  <DataTable.Cell>
                    {numeral($sum).format('0,0')}
                  </DataTable.Cell>
                </FixedRow>
              )
            }
          },
          { rows: [], sum: 0 }
        ).rows}
      </DataTable.Body>
    </DataTable.Container>
  );
}

QuoteDataTable.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string
};
