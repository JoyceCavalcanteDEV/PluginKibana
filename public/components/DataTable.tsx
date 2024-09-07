import React, { useEffect, useState } from 'react';
import axios, { AxiosResponse, AxiosError } from 'axios';
import {
    EuiInMemoryTable,
    EuiFieldText,
    EuiFormRow,
    EuiModal,
    EuiModalBody,
    EuiModalFooter,
    EuiModalHeader,
    EuiModalHeaderTitle,
    EuiOverlayMask,
    EuiButton,
    EuiAccordion,
    EuiFlexGroup,
    EuiFlexItem,
} from '@elastic/eui';

interface IDataTable {
    selectedIndex?: string;
    getData: boolean;
    selectedFields?: string[];
    defaultSelectedIndex?: string;  // Adicionada
    defaultSelectedFields?: string[];  // Adicionada
    notifications: any;
}

export const DataTable: React.FC<IDataTable> = (props) => {
    const [columns, columnsSet] = useState<any>([]);
    const [tableData, tableDataSet] = useState<any>([]);
    const [editItem, setEditItem] = useState<any>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isNewFieldModal, setIsNewFieldModal] = useState(false);
    const [updatedFields, setUpdatedFields] = useState<any>({});
    const [newFieldName, setNewFieldName] = useState<any>('');
    const [newFieldValue, setNewFieldValue] = useState<any>('');
    const [selectedField, setSelectedField] = useState<string | null>(null);
    const [selectedSubField, setSelectedSubField] = useState<string | null>(null);
    const [isDiagnosticModal, setIsDiagnosticModal] = useState(false);
    const [diagnosticValues, setDiagnosticValues] = useState<{ [key: string]: string }>({});
    const [activeFields, setActiveFields] = useState<{ [key: string]: boolean }>({});
    const [previousIndex, setPreviousIndex] = useState<string>(props.defaultSelectedIndex || '');

    // Função para resetar colunas
    const resetColumnsAndData = () => {
        columnsSet([]);  // Limpa as colunas anteriores
        tableDataSet([]); // Limpa os dados anteriores
    };

    // Função para definir as novas colunas baseadas nos campos selecionados
    const updateColumns = (fields: string[]) => {
        let columnsArray: any = [{
            field: '_id',
            name: 'ID',
            sortable: true,
            truncateText: true,
        }];

        // Adiciona colunas baseadas nos campos selecionados
        for (let field of fields) {
            columnsArray.push({
                field: `_source.${field}`,
                name: field,
                sortable: true,
                truncateText: true,
            });
        }

        // Adiciona as ações da tabela
        columnsArray.push({
            name: 'Actions',
            actions: [
                {
                    name: 'Diagnóstico',
                    description: 'Diagnóstico do item',
                    type: 'icon',
                    icon: 'inspect',
                    onClick: (item: any) => onDiagnostico(item),
                },
                {
                    name: 'NewField',
                    description: 'Add a new field and value',
                    type: 'icon',
                    icon: 'plusInCircle',
                    onClick: (item: any) => onAddNewField(item),
                },
                {
                    name: 'Edit',
                    description: 'Edit this item',
                    type: 'icon',
                    icon: 'documentEdit',
                    onClick: (item: any) => onEdit(item),
                },
                {
                    name: 'Clone',
                    description: 'Clone this item',
                    type: 'icon',
                    icon: 'copy',
                    onClick: (item: any) => onClone(item),
                },
                {
                    name: 'Delete',
                    description: 'Delete this item',
                    type: 'icon',
                    icon: 'trash',
                    onClick: (item: any) => onDelete(item),
                }
            ],
        });

        // Atualiza as colunas com base nos novos campos
        columnsSet(columnsArray);
    };

    // Carrega os dados da tabela ao iniciar ou quando selectedFields ou selectedIndex mudar
    useEffect(() => {
        const selectedIndex = props.selectedIndex || props.defaultSelectedIndex || 'kibana_sample_data_flights';
        const selectedFields = props.selectedFields || props.defaultSelectedFields || [];

        axios({
            method: "post",
            url: "../api/myPlugin/get_table_data",
            data: {
                selectedIndex: selectedIndex,
                selectedFields: selectedFields,
            },
            headers: { "Content-Type": "application/json", "kbn-xsrf": "true" },
        })
        .then((response: AxiosResponse) => {
            tableDataSet(response.data.reply);
        })
        .catch((error: AxiosError) => {
            console.error("Erro ao buscar dados da tabela:", error);
        });
    }, [props.defaultSelectedIndex, props.defaultSelectedFields]);

    // Atualiza a tabela e as colunas ao alterar o índice
    useEffect(() => {
        const currentSelectedIndex = props.selectedIndex || props.defaultSelectedIndex || '';

        // Resetar a tabela e as colunas sempre que o índice for alterado
        if (currentSelectedIndex !== previousIndex) {
            // Atualiza o índice anterior para o novo índice
            setPreviousIndex(currentSelectedIndex);

            // Reseta as colunas e dados
            resetColumnsAndData();

            // Atualizar colunas com os campos do novo índice
            const selectedFields = props.selectedFields || [];
            updateColumns(selectedFields);

            // Faz a requisição para obter os novos dados da tabela com o novo índice e campos
            axios({
                method: 'post',
                url: '../api/myPlugin/get_table_data',
                data: {
                    selectedIndex: currentSelectedIndex,
                    selectedFields: selectedFields,
                },
                headers: { "Content-Type": "application/json", "kbn-xsrf": "true" },
            })
            .then((response: AxiosResponse) => {
                tableDataSet(response.data.reply);
            })
            .catch((error: AxiosError) => {
                console.error('Erro ao buscar dados da tabela:', error);
                props.notifications.toasts.addError(error, { title: 'Erro ao buscar dados' });
            });
        }
    }, [props.selectedIndex, props.selectedFields]);  // Atualiza apenas quando o índice ou os campos mudarem

    const onAddNewField = (item: any) => {
        setEditItem(item);
        setUpdatedFields(item._source);
        setNewFieldName('');
        setNewFieldValue('');
        setIsNewFieldModal(true);
        setIsModalVisible(true);
    };

    const onEdit = (item: any) => {
        setEditItem(item);
        setUpdatedFields(item._source);
        setIsNewFieldModal(false);
        setIsModalVisible(true);
    };

    const onDiagnostico = (item: any) => {
        setEditItem(item);
        setDiagnosticValues({});
        setIsDiagnosticModal(true);
        setIsModalVisible(true);
    };

    const onSaveEdit = () => {
        let updatedFields = { ...editItem._source };
    
        // Se estivermos no modo de adicionar um novo campo
        if (isNewFieldModal && newFieldName && newFieldValue) {
            updatedFields[newFieldName] = newFieldValue;
    
            if (!props.selectedFields?.includes(newFieldName)) {
                props.selectedFields?.push(newFieldName);
            }
        }
    
        // Adiciona os campos de diagnóstico ao objeto de campos atualizados
        if (isDiagnosticModal) {
            updatedFields = { ...updatedFields, ...diagnosticValues };
            
            // Verifica se as colunas de diagnóstico precisam ser adicionadas
            Object.keys(diagnosticValues).forEach((diagnosticKey) => {
                if (!props.selectedFields?.includes(diagnosticKey)) {
                    props.selectedFields?.push(diagnosticKey);
    
                    // Adiciona uma nova coluna para o diagnóstico se ainda não existir
                    const newColumn = {
                        field: '_source.' + diagnosticKey,
                        name: diagnosticKey,
                        sortable: true,
                        truncateText: true,
                    };
                    columnsSet([...columns.slice(0, columns.length - 1), newColumn, ...columns.slice(-1)]);
                }
            });
        }
    
        axios.post('../api/myPlugin/update_item', {
            index: props.selectedIndex || props.defaultSelectedIndex,
            id: editItem._id,
            updatedFields
        }, {
            headers: { "Content-Type": "application/json", "kbn-xsrf": "true" }
        })
        .then((response: AxiosResponse) => {
            if (response.status === 200) {
                const updatedData = tableData.map((dataItem: any) => {
                    if (dataItem._id === editItem._id) {
                        return { ...dataItem, _source: { ...updatedFields } };
                    }
                    return dataItem;
                });
    
                tableDataSet(updatedData);
    
                if (isNewFieldModal && newFieldName) {
                    const newColumn = {
                        field: '_source.' + newFieldName,
                        name: newFieldName,
                        sortable: true,
                        truncateText: true,
                    };
                    columnsSet([...columns.slice(0, columns.length - 1), newColumn, ...columns.slice(-1)]);
                }
    
                props.notifications.toasts.addSuccess('Item atualizado com sucesso!');
            } else {
                props.notifications.toasts.addError(new Error('Falha ao atualizar o item.'), {
                    title: 'Erro ao atualizar item',
                });
            }
        })
        .catch((error: AxiosError) => {
            console.error('Erro ao atualizar item:', error);
            props.notifications.toasts.addError(error, {
                title: 'Erro ao atualizar item',
            });
        });
    };    

    const onClone = (item: any) => {
        // Implementar lógica de clone aqui
    };

    const onDelete = (item: any) => {
        // Implementar lógica de delete aqui
    };

    const handleFieldChange = (field: string, value: any) => {
        setUpdatedFields({ ...updatedFields, [field]: value });
    };

    const handleFieldSelection = (field: string) => {
        setSelectedField(field);
        setSelectedSubField(null);
    };

    const handleSubFieldSelection = (subField: string) => {
        setSelectedSubField(subField);
    };

    const handleDiagnosticValueChange = (key: string, value: string) => {
        setDiagnosticValues((prevState) => ({
            ...prevState,
            [key]: value,
        }));
    };

    const toggleFieldVisibility = (key: string) => {
        setActiveFields((prevState) => ({
            ...prevState,
            [key]: !prevState[key],
        }));
    };

    return (
        <>
            <EuiInMemoryTable
                items={tableData}
                columns={columns}
                pagination={true}
            />

            {isModalVisible && (
                <EuiOverlayMask>
                    <EuiModal onClose={() => setIsModalVisible(false)} initialFocus="[name=popswitch]" style={{ width: '800px' }}>
                        <EuiModalHeader>
                            <EuiModalHeaderTitle>
                                {isNewFieldModal ? 'Add a new field' : isDiagnosticModal ? 'Diagnóstico' : 'Edit item'}
                            </EuiModalHeaderTitle>
                        </EuiModalHeader>

                        <EuiModalBody>
                            {isDiagnosticModal ? (
                                <>
                                    <EuiAccordion
                                        id="diagnostico"
                                        buttonContent="Diagnóstico"
                                        paddingSize="m"
                                        initialIsOpen={true}
                                    >
                                        <EuiAccordion
                                            id="detalhamentoInformacional"
                                            buttonContent="Detalhamento Informacional"
                                            paddingSize="m"
                                            initialIsOpen={true}
                                        >
                                            <EuiFlexGroup direction="column" gutterSize="s">
                                                <EuiFlexItem>
                                                    <EuiButton
                                                        onClick={() => toggleFieldVisibility('Padronização')}
                                                        style={{ marginBottom: '5px' }}
                                                    >
                                                        Padronização
                                                    </EuiButton>
                                                    {activeFields['Padronização'] && (
                                                        <EuiFlexItem>
                                                            <EuiFieldText
                                                                fullWidth
                                                                value={diagnosticValues['Padronização'] || ''}
                                                                onChange={(e) => handleDiagnosticValueChange('Padronização', e.target.value)}
                                                            />
                                                        </EuiFlexItem>
                                                    )}
                                                </EuiFlexItem>
                                                <EuiFlexItem>
                                                    <EuiButton
                                                        onClick={() => toggleFieldVisibility('Correção')}
                                                        style={{ marginBottom: '5px' }}
                                                    >
                                                        Correção
                                                    </EuiButton>
                                                    {activeFields['Correção'] && (
                                                        <EuiFlexItem>
                                                            <EuiFieldText
                                                                fullWidth
                                                                value={diagnosticValues['Correção'] || ''}
                                                                onChange={(e) => handleDiagnosticValueChange('Correção', e.target.value)}
                                                            />
                                                        </EuiFlexItem>
                                                    )}
                                                </EuiFlexItem>
                                                <EuiFlexItem>
                                                    <EuiButton
                                                        onClick={() => toggleFieldVisibility('Informação Duplicada')}
                                                        style={{ marginBottom: '5px' }}
                                                    >
                                                        Informação Duplicada
                                                    </EuiButton>
                                                    {activeFields['Informação Duplicada'] && (
                                                        <EuiFlexItem>
                                                            <EuiFieldText
                                                                fullWidth
                                                                value={diagnosticValues['Informação Duplicada'] || ''}
                                                                onChange={(e) => handleDiagnosticValueChange('Informação Duplicada', e.target.value)}
                                                            />
                                                        </EuiFlexItem>
                                                    )}
                                                </EuiFlexItem>
                                            </EuiFlexGroup>
                                        </EuiAccordion>

                                        <EuiAccordion
                                            id="detalhamentoOperacional"
                                            buttonContent="Detalhamento Operacional"
                                            paddingSize="m"
                                            initialIsOpen={true}
                                        >
                                            <EuiFlexGroup direction="column" gutterSize="s">
                                                <EuiFlexItem>
                                                    <EuiButton
                                                        onClick={() => toggleFieldVisibility('Pergunta Genérica')}
                                                        style={{ marginBottom: '5px' }}
                                                    >
                                                        Pergunta Genérica
                                                    </EuiButton>
                                                    {activeFields['Pergunta Genérica'] && (
                                                        <EuiFlexItem>
                                                            <EuiFieldText
                                                                fullWidth
                                                                value={diagnosticValues['Pergunta Genérica'] || ''}
                                                                onChange={(e) => handleDiagnosticValueChange('Pergunta Genérica', e.target.value)}
                                                            />
                                                        </EuiFlexItem>
                                                    )}
                                                </EuiFlexItem>
                                                <EuiFlexItem>
                                                    <EuiButton
                                                        onClick={() => toggleFieldVisibility('Resposta Correta')}
                                                        style={{ marginBottom: '5px' }}
                                                    >
                                                        Resposta Correta
                                                    </EuiButton>
                                                    {activeFields['Resposta Correta'] && (
                                                        <EuiFlexItem>
                                                            <EuiFieldText
                                                                fullWidth
                                                                value={diagnosticValues['Resposta Correta'] || ''}
                                                                onChange={(e) => handleDiagnosticValueChange('Resposta Correta', e.target.value)}
                                                            />
                                                        </EuiFlexItem>
                                                    )}
                                                </EuiFlexItem>
                                            </EuiFlexGroup>
                                        </EuiAccordion>

                                        <EuiAccordion
                                            id="detalhamentoTecnico"
                                            buttonContent="Detalhamento Técnico"
                                            paddingSize="m"
                                            initialIsOpen={true}
                                        >
                                            <EuiFlexGroup direction="column" gutterSize="s">
                                                <EuiFlexItem>
                                                    <EuiButton
                                                        onClick={() => toggleFieldVisibility('Número do Incidente')}
                                                        style={{ marginBottom: '5px' }}
                                                    >
                                                        Número do Incidente
                                                    </EuiButton>
                                                    {activeFields['Número do Incidente'] && (
                                                        <EuiFlexItem>
                                                            <EuiFieldText
                                                                fullWidth
                                                                value={diagnosticValues['Número do Incidente'] || ''}
                                                                onChange={(e) => handleDiagnosticValueChange('Número do Incidente', e.target.value)}
                                                            />
                                                        </EuiFlexItem>
                                                    )}
                                                </EuiFlexItem>

                                                <EuiFlexItem>
                                                    <EuiButton
                                                        onClick={() => toggleFieldVisibility('Data de Abertura do Incidente')}
                                                        style={{ marginBottom: '5px' }}
                                                    >
                                                        Data de Abertura do Incidente
                                                    </EuiButton>
                                                    {activeFields['Data de Abertura do Incidente'] && (
                                                        <EuiFlexItem>
                                                            <EuiFieldText
                                                                fullWidth
                                                                value={diagnosticValues['Data de Abertura do Incidente'] || ''}
                                                                onChange={(e) => handleDiagnosticValueChange('Data de Abertura do Incidente', e.target.value)}
                                                            />
                                                        </EuiFlexItem>
                                                    )}
                                                </EuiFlexItem>

                                                <EuiFlexItem>
                                                    <EuiButton
                                                        onClick={() => toggleFieldVisibility('Data da Finalização do Incidente')}
                                                        style={{ marginBottom: '5px' }}
                                                    >
                                                        Data da Finalização do Incidente
                                                    </EuiButton>
                                                    {activeFields['Data da Finalização do Incidente'] && (
                                                        <EuiFlexItem>
                                                            <EuiFieldText
                                                                fullWidth
                                                                value={diagnosticValues['Data da Finalização do Incidente'] || ''}
                                                                onChange={(e) => handleDiagnosticValueChange('Data da Finalização do Incidente', e.target.value)}
                                                            />
                                                        </EuiFlexItem>
                                                    )}
                                                </EuiFlexItem>
                                            </EuiFlexGroup>
                                        </EuiAccordion>
                                    </EuiAccordion>
                                </>
                            ) : (
                                <>
                                    <EuiFormRow label="New Field Name">
                                        <EuiFieldText
                                            value={newFieldName}
                                            onChange={(e) => setNewFieldName(e.target.value)}
                                            disabled={!isNewFieldModal}
                                        />
                                    </EuiFormRow>
                                    <EuiFormRow label="New Field Value">
                                        <EuiFieldText
                                            value={newFieldValue}
                                            onChange={(e) => setNewFieldValue(e.target.value)}
                                        />
                                    </EuiFormRow>
                                </>
                            )}
                        </EuiModalBody>

                        <EuiModalFooter>
                            <EuiButton onClick={() => setIsModalVisible(false)}>Cancel</EuiButton>
                            <EuiButton type="submit" onClick={onSaveEdit} fill>
                                Save
                            </EuiButton>
                        </EuiModalFooter>
                    </EuiModal>
                </EuiOverlayMask>
            )}
        </>
    );
};