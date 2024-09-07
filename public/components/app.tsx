import React, { useState, useEffect } from 'react';
import { SelectIndex } from './SelectIndex';
import { SelectFields } from './SelectFields';
import { DataTable } from './DataTable';

import {
  EuiButton,
  EuiPageTemplate,
  EuiPageHeaderProps,
  EuiPageSidebarProps,
  EuiPageTemplateProps,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
} from '@elastic/eui';
import { CoreStart } from '@kbn/core/public';

const CustomPageTemplate = ({
  button,
  content,
  sidebar,
  header,
  panelled,
  bottomBorder,
  sidebarSticky,
  offset,
  grow,
}: {
  button: React.ReactElement;
  content: React.ReactElement;
  sidebar?: React.ReactElement;
  header?: EuiPageHeaderProps;
  panelled?: boolean;
  bottomBorder?: boolean;
  sidebarSticky?: EuiPageSidebarProps['sticky'];
  offset?: EuiPageTemplateProps['offset'];
  grow?: EuiPageTemplateProps['grow'];
}) => {
  return (
    <EuiPageTemplate
      panelled={panelled}
      bottomBorder={bottomBorder}
      grow={grow}
      offset={offset}
    >
      {sidebar && (
        <EuiPageTemplate.Sidebar sticky={sidebarSticky}>
          {sidebar}
        </EuiPageTemplate.Sidebar>
      )}
      {header && (
        <EuiPageTemplate.Header {...header} rightSideItems={[button]} />
      )}
      <EuiPageTemplate.Section>{content}</EuiPageTemplate.Section>
    </EuiPageTemplate>
  );
};

interface AppProps {
  notifications: CoreStart['notifications'];
}

export const App = ({ notifications }: AppProps) => {
  const [selectedIndex, setSelectedIndex] = useState<string>('kibana_sample_data_flights');
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'AvgTicketPrice',
    'Cancelled',
    'Dest',
    'DistanceMiles'
  ]);
  const [showDataTable, setShowDataTable] = useState<boolean>(true);

  useEffect(() => {
    if (selectedFields.length > 0 && selectedIndex) {
      setShowDataTable(true);
    } else {
      setShowDataTable(false);
    }
  }, [selectedFields, selectedIndex]);

  const handleIndexSelect = (index: string) => {
    setSelectedIndex(index);
    // Resetar os campos quando o índice for alterado
    setSelectedFields([]); // Zera os campos ao alterar o índice
    setShowDataTable(false);
  };

  const handleFieldsSelect = (fields: any[]) => {
    const fieldLabels = fields.map((field: any) => field.label);
    setSelectedFields(prevFields => {
      const newFields = fieldLabels.filter(field => !prevFields.includes(field));
      return [...prevFields, ...newFields];
    });
  };

  const handleButtonClick = () => {
    if (selectedIndex && selectedFields.length > 0) {
      setShowDataTable(false); 
      setTimeout(() => {
        setShowDataTable(true);
      }, 50);
    } else {
      notifications.toasts.addWarning('Por favor, selecione um índice e campos antes de obter os dados.');
    }
  };

  return (
    <CustomPageTemplate
      button={<EuiButton onClick={handleButtonClick}>Get Data</EuiButton>}
      content={
        <>
          <EuiFlexGroup>
            <EuiFlexItem>
              <SelectIndex selectedIndex={handleIndexSelect} defaultSelectedIndex={selectedIndex} />
            </EuiFlexItem>
            <EuiFlexItem>
              <SelectFields selectedFields={handleFieldsSelect} selectedIndex={selectedIndex} defaultSelectedFields={selectedFields} />
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="xl" />
          {showDataTable && (
              <DataTable
                key={`${selectedIndex}-${selectedFields.join(',')}`}
                selectedFields={selectedFields}
                selectedIndex={selectedIndex}
                getData={showDataTable}
                notifications={notifications}
              />
            )}
        </>
      }
      header={{
        pageTitle: 'Kibana Fields Management',
      }}
    />
  );
};