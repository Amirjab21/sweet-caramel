import {
  DefaultDualActionWideModalProps,
  DualActionWideModalProps,
} from 'components/Modal/DualActionWideModal';
import { DefaultSingleActionModalProps } from 'components/Modal/SingleActionModal';
import { NotificationProps } from 'components/Notifications/NotificationProps';
import { StakingPageInfo } from 'pages/staking/[id]';
import React, { createContext, useReducer } from 'react';
import {
  DefaultDualActionModalProps,
  DualActionModalProps,
} from '../components/Modal/DualActionModal';
import { SingleActionModalProps } from '../components/Modal/SingleActionModal';
import {
  DefaultWalletSelectModalProps,
  WalletSelectModalProps,
} from '../components/Modal/WalletSelectModal';
import {
  AppActions,
  CLEAR_NOTIFICATIONS,
  DUAL_ACTION_MODAL,
  DUAL_ACTION_WIDE_MODAL,
  HIDE_NOTIFICATION,
  PUSH_NOTIFICATION,
  SINGLE_ACTION_MODAL,
  UNSET_NOTIFICATION,
  UPDATE_STAKING_PAGE_INFO,
  WALLET_SELECT_MODAL,
} from './actions';

interface DefaultState {
  notifications: NotificationProps[];
  singleActionModal: SingleActionModalProps;
  dualActionModal: DualActionModalProps;
  dualActionWideModal: DualActionWideModalProps;
  walletSelectModal: WalletSelectModalProps;
  stakingPageInfo?: StakingPageInfo;
}

const initialState: DefaultState = {
  notifications: [],
  singleActionModal: {
    ...DefaultSingleActionModalProps,
  },
  dualActionModal: {
    ...DefaultDualActionModalProps,
  },
  dualActionWideModal: {
    ...DefaultDualActionWideModalProps,
  },
  walletSelectModal: {
    ...DefaultWalletSelectModalProps,
  },
  stakingPageInfo: undefined,
};

const store = createContext(
  initialState as unknown as {
    state: DefaultState;
    dispatch: React.Dispatch<any>;
  },
);
const { Provider } = store;

const StateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(
    (state: DefaultState, action: AppActions) => {
      switch (action.type) {
        case PUSH_NOTIFICATION:
          return {
            ...state,
            notifications: [...state.notifications, action.payload],
          };
        case HIDE_NOTIFICATION:
          return {
            ...state,
            notifications: [
              ...state.notifications.map((notification) => {
                if (notification.id == action.payload) {
                  notification.visible = false;
                }
                return notification;
              }),
            ],
          };
        case UNSET_NOTIFICATION:
          return {
            ...state,
            notifications: [
              ...state.notifications.filter(
                (notification) => notification.id !== action.payload,
              ),
            ],
          };
        case CLEAR_NOTIFICATIONS:
          return {
            ...state,
            notifications: [
              ...state.notifications.map((notification) => {
                notification.visible = false;
                return notification;
              }),
            ],
          };
        case SINGLE_ACTION_MODAL:
          return {
            ...state,
            singleActionModal: {
              ...action.payload,
            },
          };
        case DUAL_ACTION_MODAL:
          return {
            ...state,
            dualActionModal: {
              ...action.payload,
            },
          };
        case DUAL_ACTION_WIDE_MODAL:
          return {
            ...state,
            dualActionWideModal: {
              ...action.payload,
            },
          };
        case UPDATE_STAKING_PAGE_INFO:
          return {
            ...state,
            stakingPageInfo: {
              ...action.payload,
            },
          };
        case WALLET_SELECT_MODAL:
          console.log(action, 'action');
          return {
            ...state,
            walletSelectModal: {
              ...state.walletSelectModal,
              ...action.payload,
              // visible: !state.walletSelectModal.visible,
            },
          };
        default:
          return {
            ...state,
          };
      }
    },
    initialState,
  );

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, StateProvider };
