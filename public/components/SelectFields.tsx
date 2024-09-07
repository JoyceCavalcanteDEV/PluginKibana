import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { EuiComboBox, EuiComboBoxOptionOption } from '@elastic/eui';

// Define a interface para o tipo de campo que você está esperando
interface Field {
  name: string;
}

// Define a interface para as props do componente
interface SelectFieldsProps {
  selectedFields: (fields: EuiComboBoxOptionOption<string>[]) => void;
  selectedIndex: string;
  defaultSelectedFields: string[];
}

export const SelectFields: React.FC<SelectFieldsProps> = ({ selectedIndex, selectedFields, defaultSelectedFields }) => {
  const [options, setOptions] = useState<EuiComboBoxOptionOption<string>[]>([]);
  const [selected, setSelected] = useState<EuiComboBoxOptionOption<string>[]>([]);

  useEffect(() => {
    if (selectedIndex) {
      axios.get<{ fields: Field[] }>(`../internal/data_views/_fields_for_wildcard?pattern=${selectedIndex}`, {
        headers: {
          'elastic-api-version': '1',
          'kbn-xsrf': 'true'
        }
      })
      .then((response) => {
        const fields = response.data.fields.map((field) => ({
          label: field.name,
        }));
        setOptions(fields);

        // Verifica se há campos padrão definidos
        if (defaultSelectedFields.length > 0) {
          const defaultFields = fields.filter(field => defaultSelectedFields.includes(field.label));
          setSelected(defaultFields);
          selectedFields(defaultFields); // Notifica os campos selecionados
        }
      })
      .catch((error) => {
        console.error('Error fetching fields:', error);
      });
    }
  }, [selectedIndex, defaultSelectedFields]);

  const onChange = (selectedOptions: EuiComboBoxOptionOption<string>[]) => {
    setSelected(selectedOptions);
    selectedFields(selectedOptions);
  };

  return (
    <EuiComboBox
      placeholder="Select Fields"
      options={options}
      selectedOptions={selected}
      onChange={onChange}
      singleSelection={false}
      fullWidth={true}
      isClearable={true}
    />
  );
};