import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { EuiComboBox } from '@elastic/eui';

interface ISelectIndex {
    selectedIndex: (index: string) => void;
    defaultSelectedIndex: string;
}

// Definindo o tipo das opções
interface OptionType {
    label: string;
}

export const SelectIndex: React.FC<ISelectIndex> = (props) => {
    const [options, setOptions] = useState<OptionType[]>([]);
    const [index, setIndex] = useState<OptionType[]>([]);

    useEffect(() => {
        axios.get(`../api/saved_objects/_find?type=index-pattern&type=data_view&per_page=10000`)
            .then((response) => {
                const indexOptions: OptionType[] = response.data.saved_objects.map((val: any): OptionType => ({
                    label: val.attributes.title
                }));
                setOptions(indexOptions);

                // Verifica se há um índice padrão definido
                if (props.defaultSelectedIndex) {
                    const defaultOption = indexOptions.find((option: OptionType) => option.label === props.defaultSelectedIndex);
                    if (defaultOption) {
                        setIndex([defaultOption]);
                        props.selectedIndex(defaultOption.label); // Notifica o índice selecionado
                    }
                }
            });
    }, [props.defaultSelectedIndex]); // Dependência no índice padrão

    const onChange = (selectedOptions: OptionType[]) => {
        setIndex(selectedOptions);
        props.selectedIndex(selectedOptions.length > 0 ? selectedOptions[0].label : "");
    };

    return (
        <EuiComboBox
            placeholder="Select Data View"
            options={options}
            selectedOptions={index}
            onChange={onChange}
            singleSelection={{ asPlainText: true }}
            fullWidth={false}
            style={{ width: 300 }}
            isClearable={false}
        />
    );
};