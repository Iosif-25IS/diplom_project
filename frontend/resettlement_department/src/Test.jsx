import React, { useState, useRef, useMemo } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { data } from './MessegeData';

// Иконки
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);

const ChevronUpIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const ChevronDownIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ArrowsUpDownIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
  </svg>
);

const XIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const MessageTable = () => {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const tableContainerRef = useRef(null);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  const parseChildrenControls = (controlsString) => {
    try {
      const controls = JSON.parse(controlsString);
      return controls.map(control => ({
        person: control.person || '-',
        dueDate: control.due_date ? formatDate(control.due_date) : '-',
        closedDate: control.closed_date ? formatDate(control.closed_date) : '-',
        isControl: control.is_control === 'true' ? 'Да' : 'Нет'
      }));
    } catch (e) {
      return [];
    }
  };

  const getStatus = (item) => {
    const now = new Date();
    const executorDue = item.executor_due_date ? new Date(item.executor_due_date) : null;
    
    if (!executorDue) return 'Нет срока';
    
    if (now > executorDue) {
      return 'Просрочено';
    } else if ((executorDue - now) / (1000 * 60 * 60 * 24) <= 3) {
      return 'Срочно';
    } else {
      return 'В работе';
    }
  };

  const columns = useMemo(
    () => [
      {
        header: 'Номер',
        accessorKey: 'dgi_number',
        size: 150,
        cell: ({ row }) => (
          <div className="text-sm font-medium text-gray-900">
            {row.original.dgi_number}
          </div>
        ),
      },
      {
        header: 'Дата',
        accessorKey: 'date',
        size: 100,
        cell: ({ row }) => (
          <div className="text-sm text-gray-500">
            {formatDate(row.original.date)}
          </div>
        ),
      },
      {
        header: 'Описание',
        accessorKey: 'description',
        size: 300,
        cell: ({ row }) => (
          <div className="text-sm text-gray-900 truncate">
            {row.original.description || '-'}
          </div>
        ),
      },
      {
        header: 'Автор',
        accessorKey: 'author',
        size: 150,
        cell: ({ row }) => (
          <div className="text-sm text-gray-900">
            {row.original.author || '-'}
          </div>
        ),
      },
      {
        header: 'Срок исполнения',
        accessorKey: 'executor_due_date',
        size: 120,
        cell: ({ row }) => (
          <div className="text-sm text-gray-900">
            {formatDate(row.original.executor_due_date)}
          </div>
        ),
      },
      {
        header: 'Статус',
        accessorKey: 'status',
        size: 100,
        cell: ({ row }) => {
          const status = getStatus(row.original);
          let statusClass = '';
          
          switch(status) {
            case 'Просрочено':
              statusClass = 'bg-red-100 text-red-800';
              break;
            case 'Срочно':
              statusClass = 'bg-yellow-100 text-yellow-800';
              break;
            case 'В работе':
              statusClass = 'bg-green-100 text-green-800';
              break;
            default:
              statusClass = 'bg-gray-100 text-gray-800';
          }
          
          return (
            <span className={`text-xs px-2.5 py-1 rounded-full ${statusClass}`}>
              {status}
            </span>
          );
        },
      },
    ],
    []
  );
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    estimateSize: () => 60,
    getScrollElement: () => tableContainerRef.current,
    overscan: 10,
  });

  const handleRowClick = (row) => {
    setSelectedMessage(row.original);
    setIsDetailsVisible(true);
    setSelectedRow(row.id);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Поиск */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Поиск..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Таблица */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div
          ref={tableContainerRef}
          className="overflow-auto h-[calc(100vh-12rem)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        >
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      style={{ width: `${header.column.columnDef.size}px` }}
                    >
                      <div className="flex items-center">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <ChevronUpIcon className="ml-1 h-4 w-4 text-gray-400" />,
                          desc: <ChevronDownIcon className="ml-1 h-4 w-4 text-gray-400" />,
                        }[header.column.getIsSorted()] ?? (
                          <ArrowsUpDownIcon className="ml-1 h-4 w-4 text-gray-300 group-hover:text-gray-400" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = table.getRowModel().rows[virtualRow.index];
                return (
                  <tr
                    key={row.id}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    onClick={() => handleRowClick(row)}
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                      row.id === selectedRow ? 'bg-blue-50' : ''
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 whitespace-nowrap"
                        style={{ width: `${cell.column.columnDef.size}px` }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модальное окно с деталями */}
      {isDetailsVisible && selectedMessage && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
              onClick={() => setIsDetailsVisible(false)}
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {selectedMessage.dgi_number}
                  </h3>
                  <button
                    onClick={() => setIsDetailsVisible(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Дата документа</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(selectedMessage.date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Автор</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedMessage.author || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Срок исполнения</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(selectedMessage.executor_due_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Статус</p>
                      <p className="mt-1 text-sm">
                        <span className={`px-2.5 py-1 rounded-full ${
                          getStatus(selectedMessage) === 'Просрочено' ? 'bg-red-100 text-red-800' :
                          getStatus(selectedMessage) === 'Срочно' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {getStatus(selectedMessage)}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">Описание</p>
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                      {selectedMessage.description || 'Нет описания'}
                    </p>
                  </div>

                  {selectedMessage.children_controls && parseChildrenControls(selectedMessage.children_controls).length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Контроль</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ответственный</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Срок</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Закрыт</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Контроль</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {parseChildrenControls(selectedMessage.children_controls).map((control, index) => (
                              <tr key={index}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{control.person}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{control.dueDate}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{control.closedDate}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{control.isControl}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setIsDetailsVisible(false)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageTable;