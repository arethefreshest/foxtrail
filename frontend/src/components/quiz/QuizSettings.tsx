import React from 'react';
import { Drawer, Switch, Slider, Space } from 'antd';
import { SoundOutlined, SettingOutlined } from '@ant-design/icons';

interface QuizSettingsProps {
  visible: boolean;
  onClose: () => void;
  settings: {
    sound: boolean;
    volume: number;
    animations: boolean;
    showTimer: boolean;
  };
  onSettingChange: (setting: string, value: any) => void;
}

export const QuizSettings: React.FC<QuizSettingsProps> = ({
  visible,
  onClose,
  settings,
  onSettingChange,
}) => {
  return (
    <Drawer
      title="Quiz Settings"
      placement="right"
      onClose={onClose}
      open={visible}
    >
      <Space direction="vertical" className="w-full">
        <div className="flex justify-between items-center">
          <span>Sound Effects</span>
          <Switch
            checked={settings.sound}
            onChange={(checked) => onSettingChange('sound', checked)}
            checkedChildren={<SoundOutlined />}
            unCheckedChildren={<SoundOutlined />}
          />
        </div>

        {settings.sound && (
          <div className="ml-4">
            <span>Volume</span>
            <Slider
              value={settings.volume}
              onChange={(value) => onSettingChange('volume', value)}
              min={0}
              max={100}
              step={10}
            />
          </div>
        )}

        <div className="flex justify-between items-center">
          <span>Animations</span>
          <Switch
            checked={settings.animations}
            onChange={(checked) => onSettingChange('animations', checked)}
          />
        </div>

        <div className="flex justify-between items-center">
          <span>Show Timer</span>
          <Switch
            checked={settings.showTimer}
            onChange={(checked) => onSettingChange('showTimer', checked)}
          />
        </div>
      </Space>
    </Drawer>
  );
}; 