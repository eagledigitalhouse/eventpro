# Documentação: Componente Multi-Step para Criação/Edição de Eventos

## Visão Geral

Este documento descreve detalhadamente um componente de interface para criação e edição de eventos usando uma abordagem multi-step (múltiplas etapas). O componente divide o processo em 4 etapas principais, proporcionando uma experiência de usuário organizada e intuitiva.

## Estrutura Geral do Componente

### Etapas do Processo

1. **Informações Básicas** - Dados principais do evento
2. **Ingressos** - Configuração dos tipos de ingresso
3. **Configurações** - Ajustes avançados do evento
4. **Revisão** - Confirmação e salvamento das alterações

### Funcionalidades Principais

- Navegação entre etapas com validação
- Indicador visual de progresso
- Validação de campos obrigatórios
- Salvamento automático de dados entre etapas
- Edição de eventos existentes
- Interface responsiva

## Detalhamento das Etapas

### ETAPA 1: Informações Básicas

#### Campos Obrigatórios:
- **Título do Evento** (texto, máximo recomendado: 100 caracteres)
- **Categoria** (seleção única)
- **Data de Início** (data)
- **Horário de Início** (hora)
- **Local** (nome do local)

#### Campos Opcionais:
- **Descrição** (texto longo, até 1000 caracteres)
- **Data de Fim** (data)
- **Horário de Fim** (hora)
- **Endereço Completo** (texto)
- **Cidade** (texto)
- **CEP** (texto com máscara)
- **Imagem do Evento** (upload de arquivo)

#### Categorias Disponíveis:
- Conferência
- Workshop
- Meetup
- Seminário
- Palestra
- Curso
- Networking
- Festival
- Show
- Esporte
- Outro

#### Validações:
- Título não pode estar vazio
- Categoria deve ser selecionada
- Data de início é obrigatória
- Horário de início é obrigatório
- Nome do local é obrigatório
- Se data de fim for informada, deve ser posterior à data de início

### ETAPA 2: Ingressos

#### Estrutura de um Ingresso:
- **ID** (identificador único)
- **Nome do Ingresso** (texto, obrigatório)
- **Tipo** (seleção única, obrigatório)
- **Preço** (número decimal, obrigatório)
- **Quantidade Disponível** (número inteiro, obrigatório)
- **Descrição** (texto opcional)
- **Data de Início das Vendas** (data opcional)
- **Data de Fim das Vendas** (data opcional)
- **Status Ativo** (boolean)

#### Tipos de Ingresso Disponíveis:
- **Gratuito** - Preço automaticamente definido como R$ 0,00
- **Pago** - Preço definido pelo usuário
- **VIP** - Ingresso premium
- **Estudante** - Desconto para estudantes
- **Grupo** - Para compras em grupo
- **Promocional** - Preço promocional

#### Funcionalidades:
- **Adicionar Ingresso** - Botão para criar novo tipo de ingresso
- **Remover Ingresso** - Excluir tipo de ingresso existente
- **Editar Ingresso** - Modificar dados de ingresso existente
- **Ativar/Desativar** - Toggle para controlar disponibilidade
- **Resumo Individual** - Card com resumo de cada ingresso (tipo, preço, quantidade, receita estimada)
- **Resumo Geral** - Card com totais consolidados de todos os ingressos
- **Cálculos Automáticos** - Receita estimada calculada automaticamente (preço × quantidade)

#### Validações:
- Deve existir pelo menos um tipo de ingresso
- Nome do ingresso não pode estar vazio
- Quantidade deve ser maior que zero
- Preço não pode ser negativo
- Para tipo "Gratuito", preço é automaticamente R$ 0,00

#### Comportamentos Especiais:
- Quando tipo "Gratuito" é selecionado, campo preço é desabilitado e zerado
- Formatação automática de preço em Real (R$)
- Validação de datas de venda (início deve ser anterior ao fim)
- **Cálculos em Tempo Real**: Receita estimada atualizada automaticamente ao alterar preço ou quantidade
- **Resumo Individual por Ingresso**: Cada ingresso mostra seu próprio resumo com:
  - Tipo do ingresso
  - Preço unitário
  - Quantidade disponível
  - Receita estimada total (preço × quantidade)
- **Resumo Geral Consolidado**: Card separado mostrando:
  - Lista de todos os ingressos com preços e status
  - Total de ingressos disponíveis (soma de todas as quantidades)
  - Receita potencial total (soma de todas as receitas estimadas)
  - Status ativo/inativo de cada tipo
- **Formatação Monetária**: Todos os valores são formatados em Real brasileiro (R$)
- **Tratamento de Gratuitos**: Ingressos gratuitos mostram "Gratuito" e "R$ 0,00" nos cálculos

### ETAPA 3: Configurações Avançadas

#### Configurações de Privacidade:
- **Privacidade do Evento**
  - Público (visível para todos)
  - Privado (apenas com convite)
  - Restrito (mediante aprovação)

#### Configurações de Registro:
- **Tipo de Registro**
  - Livre (qualquer pessoa pode se inscrever)
  - Moderado (inscrições precisam de aprovação)
  - Fechado (apenas convidados)

#### Configurações de Capacidade:
- **Capacidade Máxima** (número inteiro opcional)
- **Permitir Lista de Espera** (boolean)

#### Configurações de Formulário:
- **Formulário Personalizado** (boolean)
- **Confirmação por Email** (boolean, padrão: true)
- **Lembrete Automático** (boolean)

#### Configurações Sociais:
- **Compartilhamento Social** (boolean, padrão: true)
- **Mostrar Lista de Participantes** (boolean)
- **URL Personalizada** (texto opcional)

#### Configurações LGPD:
- **Conformidade LGPD** (boolean, padrão: true)
- **Permitir Opt-out** (boolean, padrão: true)
- **Consentimento para Fotos** (boolean)

#### Configurações Financeiras:
- **Desconto Padrão** (percentual)
- **Taxa de Processamento** (percentual, padrão: 2.5%)
- **Timeout de Pagamento** (minutos, padrão: 15)

#### Configurações de Check-in:
- **Check-in via QR Code** (boolean, padrão: true)
- **Check-in Antecipado** (boolean)

### ETAPA 4: Revisão e Confirmação

#### Funcionalidades:
- **Visualização Resumida** de todas as informações inseridas
- **Edição Rápida** - Links para voltar a etapas específicas
- **Validação Final** de todos os dados
- **Botão de Salvamento** com feedback visual

#### Seções de Revisão:
1. **Resumo das Informações Básicas**
   - Título, categoria, data/hora, local
   - Miniatura da imagem (se fornecida)

2. **Resumo dos Ingressos**
   - Lista de todos os tipos de ingresso
   - Preços e quantidades
   - Total de ingressos disponíveis

3. **Resumo das Configurações**
   - Principais configurações ativadas
   - Configurações de privacidade e registro

#### Ações Disponíveis:
- **Editar Seção** - Retorna à etapa específica para edição
- **Salvar Evento** - Confirma e salva todas as informações
- **Cancelar** - Descarta alterações e retorna

## Navegação e Validação

### Sistema de Navegação:
- **Indicador Visual** mostra progresso atual
- **Navegação Sequencial** com botões Anterior/Próximo
- **Navegação Direta** clicando no indicador (com validação)
- **Validação Automática** antes de avançar para próxima etapa

### Validações por Etapa:
- **Etapa 1**: Campos obrigatórios devem estar preenchidos
- **Etapa 2**: Pelo menos um ingresso válido deve existir
- **Etapa 3**: Sem validações obrigatórias (configurações opcionais)
- **Etapa 4**: Validação final de todas as etapas anteriores

### Mensagens de Erro:
- Exibidas via toast/notificação
- Específicas para cada tipo de erro
- Direcionam o usuário para o campo problemático

## Estados e Comportamentos

### Estados do Componente:
- **Carregamento Inicial** - Ao carregar dados de evento existente
- **Navegação** - Durante transições entre etapas
- **Validação** - Durante verificação de campos
- **Salvamento** - Durante processo de salvamento
- **Erro** - Quando ocorrem problemas

### Comportamentos Especiais:
- **Auto-save** - Dados são mantidos ao navegar entre etapas
- **Recuperação** - Dados são preservados em caso de erro
- **Responsividade** - Interface adapta-se a diferentes tamanhos de tela
- **Acessibilidade** - Suporte a navegação por teclado e leitores de tela

## Interface Visual

### Componentes Utilizados:
- **Cards** - Para agrupar seções de conteúdo
- **Inputs** - Campos de texto simples
- **Textareas** - Campos de texto longo
- **Selects** - Listas de seleção
- **Switches** - Controles boolean
- **Buttons** - Ações primárias e secundárias
- **Badges** - Indicadores de status
- **Progress Indicator** - Mostra progresso atual

### Layout:
- **Container Centralizado** com largura máxima
- **Cabeçalho** com título e ações principais
- **Indicador de Progresso** sempre visível
- **Área de Conteúdo** para etapa atual
- **Navegação** na parte inferior (quando aplicável)

### Responsividade:
- **Desktop**: Layout em duas colunas quando apropriado
- **Tablet**: Layout adaptado com espaçamento otimizado
- **Mobile**: Layout em coluna única com elementos empilhados

## Integração e Dados

### Props do Componente Principal:
- **eventoExistente** - Dados do evento para edição (opcional)
- **onSalvarEvento** - Callback para salvar dados
- **onCancelar** - Callback para cancelar operação

### Estrutura de Dados de Saída:
```
{
  informacoesBasicas: {
    titulo: string,
    descricao: string,
    categoria: string,
    dataInicio: string,
    horaInicio: string,
    dataFim: string,
    horaFim: string,
    local: string,
    endereco: string,
    cidade: string,
    cep: string,
    imagemEvento: string
  },
  ingressos: [{
    id: string,
    nome: string,
    tipo: string,
    preco: number,
    quantidade: number,
    descricao: string,
    dataInicioVenda: string,
    dataFimVenda: string,
    ativo: boolean
  }],
  configuracoes: {
    privacidade: string,
    tipoRegistro: string,
    capacidadeMaxima: string,
    permitirListaEspera: boolean,
    formularioPersonalizado: boolean,
    confirmacaoEmail: boolean,
    lembreteAutomatico: boolean,
    compartilhamentoSocial: boolean,
    mostrarParticipantes: boolean,
    urlPersonalizada: string,
    conformidadeLGPD: boolean,
    permitirOptOut: boolean,
    consentimentoFoto: boolean,
    descontoPadrao: string,
    taxaProcessamento: string,
    timeoutPagamento: string,
    checkinQRCode: boolean,
    checkinAntecipado: boolean
  }
}
```

## Considerações de UX/UI

### Princípios de Design:
- **Simplicidade** - Interface limpa e intuitiva
- **Progressão Clara** - Usuário sempre sabe onde está
- **Feedback Imediato** - Validações e confirmações em tempo real
- **Recuperação de Erro** - Fácil correção de problemas
- **Consistência** - Padrões visuais mantidos em todas as etapas

### Melhorias Sugeridas:
- **Preview em Tempo Real** - Visualização do evento sendo criado

```

Esta documentação fornece uma base completa para recriar o componente multi-step de criação/edição de eventos em qualquer aplicação, mantendo a mesma funcionalidade e experiência do usuário.
