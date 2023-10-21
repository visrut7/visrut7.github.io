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

I am talking about "Linear Regression," basically. I don't find this word intuitive enough, that's why I have not used in the title. If I break it down, it's basically defining the relationship between two variables. One would be the independent variable (x), and another would be the dependent variable y.

So you will have two types of values: observed value (actual value) $ y_i $ (from labeled data), and predicted value $ \hat{y}\_i $. Let's assume there is a linear relationship between the feature variable (x) and the predicted variable $ \hat{y}\_i $, given as $ \hat{y}\_i = m \cdot x_i + b $.

While you predict the value, you can't be assured that it would be exactly the same as the actual value $ y_i $. There would be some error. Let's calculate the mean squared error using the formula below for the whole dataset.

$$
err = \frac{1}{n} \sum_{i=1}^{n} (y_i - \hat{y}_i)^2
$$

$$
\hat{y}_i = m * x_i + b
$$

_Mean Square Error_: A very basic formula, just the square of the difference between the actual value and the predicted value, and the average of all those values from the dataset.
