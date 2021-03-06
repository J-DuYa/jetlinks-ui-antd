import React, {useEffect, useState} from 'react';
import Form from 'antd/es/form';
import {FormComponentProps} from 'antd/lib/form';
import {Button, Icon, message, Modal, Select, Tabs, Tooltip, Upload} from 'antd';
import AceEditor from "react-ace";
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/snippets/json';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-searchbox';
import 'ace-builds/src-noconflict/theme-eclipse';
import apis from "@/services";
import {DeviceProduct} from "@/pages/device/product/data";

interface Props extends FormComponentProps {
  close: Function;
  update: Function;
}

interface State {
  productList: DeviceProduct[];
  operateType: string;
}

const QuickImport: React.FC<Props> = props => {
  const initState: State = {
    productList: [],
    operateType: 'copy',
  };

  const {
    form: {getFieldDecorator},
    form,
  } = props;

  const [productList, setProductList] = useState(initState.productList);
  const [metaData, setMetaData] = useState<string>();
  const [operateType, setOperateType] = useState(initState.operateType);

  useEffect(() => {
    // 获取下拉框数据
    apis.deviceProdcut
      .queryNoPagin()
      .then(response => {
        setProductList(response.result);
      })
      .catch(() => {
      });
  }, []);

  const submitData = () => {
    let data: string = '';
    if (operateType === 'copy') {
      form.validateFields((err, fileValue) => {
        if (err) return;
        const product: Partial<DeviceProduct> =
          productList.find(i => i.id === fileValue.productId) || {};
        data = product.metadata;
      });
    } else {
      data = metaData;
    }
    props.update(data);
  };

  return (
    <Modal
      title='导入物模型'
      visible
      okText='确定'
      cancelText="取消"
      onOk={() => {
        submitData();
      }}
      onCancel={() => props.close()}
    >
      <div style={{background: 'rgb(236, 237, 238)'}}>
        <p style={{padding: 10}}>
          <span style={{color: '#f5222d'}}>注</span>：导入的物模型会覆盖原来的属性、功能、事件、标签，请谨慎操作。
          <br/>
          物模型格式请参考文档：
          <a target='_blank'
             href='http://doc.jetlinks.cn/basics-guide/device-manager.html#%E8%AE%BE%E5%A4%87%E5%9E%8B%E5%8F%B7'>
            设备型号
          </a>
        </p>
      </div>
      <Tabs onChange={(key: string) => {
        setOperateType(key);
      }} type="card">
        <Tabs.TabPane tab="拷贝产品" key="copy">
          <Form labelCol={{span: 4}} wrapperCol={{span: 20}}>
            <Form.Item key="productId" label="选择产品">
              {getFieldDecorator('productId', {
                rules: [{required: true, message: '请输入选择产品'}],
              })(<Select placeholder="请选择设备产品">
                {(productList || []).map(item => (
                  <Select.Option
                    key={JSON.stringify({productId: item.id, productName: item.name})}
                    value={item.id}
                  >
                    {item.name}
                  </Select.Option>
                ))}
              </Select>)}
            </Form.Item>
          </Form>
        </Tabs.TabPane>
        <Tabs.TabPane tab={
          <>
            导入物模型&nbsp;&nbsp;
            <Tooltip title={
              <span>
          物模型格式请参考文档：
          <a target='_blank'
             href='http://doc.jetlinks.cn/basics-guide/device-manager.html#%E8%AE%BE%E5%A4%87%E5%9E%8B%E5%8F%B7'>
          设备型号
          </a>
        </span>
            }>
              <Icon type="question-circle-o"/>
            </Tooltip>
          </>
        } key="import">
          <Upload
            showUploadList={false} accept='.json'
            beforeUpload={(file) => {
              const reader = new FileReader();
              reader.readAsText(file);
              reader.onload = (result) => {
                try {
                  let data = JSON.parse(result.target.result);
                  if (data.tags || data.properties || data.functions || data.events) {
                    setMetaData(JSON.stringify(data, null, 2));
                  } else {
                    message.error('文件内容格式错误');
                  }
                } catch (error) {
                  message.error('文件内容格式错误');
                }
              }
            }}
          >
            <Button>
              <Icon type="upload"/>快速导入
            </Button>
          </Upload>
          {metaData && (
            <div style={{border: '1px solid #E9E9E9', marginTop: 10}}>
              <AceEditor
                mode='json'
                theme="eclipse"
                name="app_code_editor"
                fontSize={14}
                value={metaData}
                onChange={value => {
                  setMetaData(value);
                }}
                showPrintMargin
                showGutter
                wrapEnabled
                highlightActiveLine  //突出活动线
                enableSnippets  //启用代码段
                style={{width: '100%', height: 400}}
                setOptions={{
                  enableBasicAutocompletion: true,   //启用基本自动完成功能
                  enableLiveAutocompletion: true,   //启用实时自动完成功能 （比如：智能代码提示）
                  enableSnippets: true,  //启用代码段
                  showLineNumbers: true,
                  tabSize: 2,
                }}
              />
            </div>
          )}
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  );
};

export default Form.create<Props>()(QuickImport);
