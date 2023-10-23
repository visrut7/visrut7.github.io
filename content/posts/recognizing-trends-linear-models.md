---
title: "Recognizing Trends using Linear Models"
date: 2023-10-21T17:15:05+05:30
draft: false
toc: false
images:
tags:
  - ML
  - Linear Regression
mathjax: true
---

I am talking about "Linear Regression". I don't find this word intuitive enough, that's why I haven't used in the title. If I break it down, it's basically defining the relationship between two variables. One would be the independent variable (x), and another would be the dependent variable (y).

So you will have two types of values: observed value (actual value) $ y_i $ (from labeled data), and predicted value $ \hat{y}\_i $. Let's assume there is a linear relationship between the feature variable ($ x_i $) and the predicted variable $ \hat{y}\_i $, given as $ \hat{y}\_i = w \cdot x_i + b $.

While you predict the value, you can't be assured that it would be exactly the same as the actual value $ y_i $. There would be some error. Let's calculate the mean squared error using the formula below for the whole dataset.

$$
err = \frac{1}{n} \sum_{i=1}^{n} (y_i - \hat{y}_i)^2
$$

$$
\hat{y}_i = w \cdot x_i + b
$$

$$
err = \frac{1}{n} \sum_{i=1}^{n} (y_i - (w \cdot x_i + b))^2
$$

_Mean Square Error_: A fundamental formula, just the square of the difference between the actual and predicted values, and the average of all those values from the dataset.

One thing you would notice here is that err is **quadratic function**.

So
$$ err = f(w, b) $$

For both variables, w and b, we must select these parameters in such a way that our error is minimized. This is crucial because if minimizing the error enables us to discover perfect line that accurately predicts the trend when provided with an independent variable. Consequently, our predictions will closely match the actual values.

If you want to get the minimum value in quadratic function, let's assume for our quadratic function parabola is growing in positive Y-direction, which it is because if you chose arbitary value for $ w $ and $ b $, $ (y_i - \hat{y}\_i)^2 $ would be positive always.

If you want to find minimum value for this type of curve you can just get to the point where slop would be $ zero $. Unfortunetely to calculate where the slop is $ zero $ we need equation for this curve and we have to find it's derivative value with respect to $ w $ and compare it with $ zero $ to find $ w's $ value. Remember our curve lies in $ w $ verses $ error $ graph.

There is one more way to find minimum value is first just take any arbitary value of $ w $, calculate the slop, if it's positive decrease the $ w $ with certain factor, and if slop is negative increase the $ w $ with certain factor. we will call this factor a Learning rate ($ L $).

$$ w = w - L \cdot \frac{\partial e}{\partial w} $$
