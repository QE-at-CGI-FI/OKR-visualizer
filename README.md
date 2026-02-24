# OKR Visualizer

A comprehensive web application for visualizing and managing Objectives and Key Results (OKRs) with an intuitive drag-and-drop interface and persistent local storage.

## Features

### 🎯 Core OKR Management

- **Objectives & Key Results**: Create and manage objectives with associated key results
- **Status Tracking**: Four distinct status levels for key results:
  - 🟢 **On Track** - Progress is on schedule
  - 🟡 **Behind** - Progress is delayed but recoverable
  - 🔴 **At Risk** - Significant issues require attention
  - 🟢 **Done** - Successfully completed (dark green)

### 📊 Strategy Map Visualization

- **Cascading View**: Visual strategy map showing objectives and their key results
- **Progress Tracking**: Automatic calculation of completion percentages
- **Color-Coded Status**: Instant visual feedback on progress status
- **Clean Layout**: Card-based interface with clear hierarchy

### 🔄 Drag & Drop Functionality

- **Reorder Objectives**: Drag objectives to change their priority order
- **Move Key Results**: Drag key results between different objectives
- **Reorder Key Results**: Change the order of key results within objectives
- **Visual Feedback**: Real-time placeholder indication during dragging

### 💾 Data Persistence & Export

- **Local Storage**: Automatic saving to browser local storage
- **Export Data**: Download your OKRs as a JSON file for backup
- **Import Data**: Upload and restore from previously exported files
- **Data Validation**: Automatic validation and cleanup of imported data

### 🎨 User Interface

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern Styling**: Clean, professional interface with subtle animations
- **Modal Dialogs**: Intuitive forms for adding and editing content
- **Status Legend**: Clear visual guide for status meanings

## Getting Started

### Installation

1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. Start creating your OKR strategy map!

### Basic Usage

1. **Add an Objective**: Click "Add Objective" button and fill in the details
2. **Add Key Results**: Click "Add Key Result" within any objective card
3. **Update Status**: Edit key results to change their status as progress is made
4. **Reorganize**: Drag and drop to reorder objectives and move key results
5. **Backup Data**: Use "Export Data" to save your work

## File Structure

```
OKR-visualizer/
├── index.html          # Main HTML structure
├── css/
│   └── styles.css      # Complete styling and responsive design
├── js/
│   ├── app.js          # Main application logic
│   ├── storage.js      # Local storage management and export/import
│   └── drag-drop.js    # Drag and drop functionality
└── README.md           # This documentation
```

## Technical Details

### Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Storage**: Browser localStorage API
- **Architecture**: Modular JavaScript classes
- **Compatibility**: Modern browsers (Chrome, Firefox, Safari, Edge)

### Key Components

#### OKRApp Class (`app.js`)

- Main application controller
- UI rendering and event handling
- Data management and persistence
- Modal dialog management

#### OKRStorage Class (`storage.js`)

- Local storage operations
- Data export/import functionality
- Data validation and cleanup
- Backup and restore capabilities

#### DragDropManager Class (`drag-drop.js`)

- Drag and drop event handling
- Visual feedback during dragging
- Drop zone management
- Reordering logic

### Data Structure

```json
{
  "objectives": [
    {
      "id": 1,
      "title": "Increase Customer Satisfaction",
      "description": "Improve overall customer experience",
      "order": 1,
      "keyResults": [
        {
          "id": 1,
          "title": "Achieve 90% customer satisfaction score",
          "description": "Based on monthly surveys",
          "status": "on-track",
          "objectiveId": 1,
          "order": 1
        }
      ]
    }
  ],
  "nextObjectiveId": 2,
  "nextKeyResultId": 2
}
```

## Best Practices

### OKR Creation

- **Objectives**: Should be qualitative, inspirational, and time-bound
- **Key Results**: Should be quantitative, specific, and measurable
- **Limit Scope**: 3-5 objectives with 3-5 key results each

### Status Management

- **Regular Updates**: Review and update key result status weekly
- **Early Warning**: Mark items "At Risk" early to address issues
- **Honest Assessment**: Use "Behind" status to acknowledge delays

### Organization

- **Priority Order**: Arrange objectives by strategic importance
- **Logical Grouping**: Group related key results under appropriate objectives
- **Regular Review**: Reorganize as priorities shift

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## Future Enhancements

Potential features for future development:

- Team collaboration and sharing
- Progress charts and analytics
- Due date tracking and reminders
- Integration with external tools
- Advanced filtering and search
- Comments and notes on key results
- Historical progress tracking

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests to improve the OKR Visualizer.
