function RadioGroup({ value, onValueChange, children }) {
    let [currentValue, setCurrentValue] = useState(value);
  ​
    useEffect(() => {
      if (currentValue !== value) {
        setCurrentValue(value);
      }
    }, [currentValue, value, setCurrentValue]);
  ​
    return (
      <View>
        {
          children.map((child, index) => React.cloneElement(child,
          {
            checked: child.props.value === currentValue,
            onCheckChange: () => {
              setCurrentValue(child.props.value);
              onValueChange && onValueChange(child.props.value)
            }
          }))
        }
      </View>
    );
  }
