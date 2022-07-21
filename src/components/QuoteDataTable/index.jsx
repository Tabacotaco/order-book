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
        const { price: limit } = result[result.length - 1] || {}; //* 取得畫面上八筆資料的最低買價 / 最高賣價

        if ((type === 'sell' && price <= limit) || (type === 'buy' && price >= limit)) {
          //* size 為 0, 則移除該筆 Price 資料
          if (!size) {
            return result.filter((quote) => price !== quote.price);
          }

          const index = result.findIndex((quote) => ((type === 'sell' && price <= quote.price) || (type === 'buy' && price >= quote.price)));

          //* 當價格 (低於當前賣價/高於當前買價)
          if (index >= 0) {
            const quote = result[index];
            const equal = quote.price === price; //* 判斷目標取代資料是否相同價格, 相同為更新 size, 不同則為插入新價格

            result.splice(index, !equal ? 0 : 1, {
              price,
              size,
  
              ...(!equal && {
                status: 'new' //* 表示為新加入之報價資料
              }),
              ...(equal && quote.size !== size && {
                status: quote.size > size ? 'minus' : 'add' //* 判斷報價數量是變多或變少 (影響 size 欄位的提醒顏色)
              })
            });
          }
        }

        return result.slice(0, __WEBPACK_DEFINE__.MAX_QUOTE_ROWS);
      },
      previous.map(({ status: _s, ...quote }) => quote) //* 捨棄前次 status 狀態
    )
  );

  function reducer(state, { type, data }) {
    switch (type) {
      case 'snapshot': {
        const { asks, bids } = data; //* 後端資料預設排序為: Price 高 > 低

        return {
          ...state,
          seq: data.seqNum,
          sell: transform(asks).reverse(), //* 反轉排序為 低 > 高 (為了取最低賣價)
          buy: transform(bids) //* 採預設排序 (為了取最高買價)
        };
      }
      case 'delta': {
        const { seq, sell, buy } = state;
        
        //* 此處取得之後端資料一樣有預設排序: Price 高 > 低
        const newSell = update('sell', transform(data.asks), sell);
        const newBuy = update('buy', transform(data.bids), buy);

        //* 當 seq 不為前次紀錄值, 或買/賣報價資料不足 8 筆時, 重新連結取得完整資料
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

        //* 當成交價更新時, 除更新成交價, 同時需要判斷成交價是漲還是跌
        if (JSON.stringify(last?.price) !== JSON.stringify(current.price)) {
          const prev = last?.price || previous.find(({ price }) => price !== current.price)?.price || current.price;

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

    //* 僅回傳應呈現於畫面上的資料筆數
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
